// import modules
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var async = require('async');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// connect database
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open", function() {
  console.log("DB connected!");
});
db.on("error", function(err) {
  console.log("DB ERROR : ", err);
});

// model setting
var postSchema = mongoose.Schema({
  title     : {type:String, required:true},
  body      : {type:String, required:true},
  createdAt : {type:Date,   default:Date.now},
  updatedAt : Date
});
var Post = mongoose.model('post', postSchema);

var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
  email : {type:String, required:true, unique:true},
  nickname : {type:String, required:true, unique:true},
  password : {type:String, required:true},
  createdAt : {type:String, default:Date.now}
});
userSchema.pre("save", function(next){
  var user = this;
  if(!user.isModified("password")){
    return next();
  } else {
    user.password = bcrypt.hashSync(user.passwrod);
    return next();
  }
});
userSchema.methods.authenticate = function (password){
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

var User = mongoose.model('user', userSchema);
// view setting
app.set("view engine", 'ejs');
// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());

app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// strategy setting
var LocalStrategy = require('passport-local').Strategy;
passport.use('local-login',
  new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done){
    User.findOne({'email' : email}, function(err, user){
      if(err) return done(err);

      if(!user){
        req.flash("email", req.body.email);
        return done(null, false, req.flash('loginError', 'No User Found.'));
      }
      if(!user.authenticate(password)) {
      //if(user.password != password) {
        req.flash("email", req.body.email);
        return done(null, false, req.flash('loginError', 'Password does not match.'));
      }
      return done(null, user);
    });
  }
)
);

// set home routes
app.get('/', function(req, res){
  res.redirect('/posts');
});
app.get('/login', function(req, res){
  res.render('login/login', {email:req.flash("email")[0],
                             loginError:req.flash('loginError') });
});
app.post('/login',
  function(req, res, next){
    req.flash("email"); // flush email data
    if(req.body.email.length === 0 || req.body.password.length === 0) {
      req.flash("email", req.body.email);
      req.flash("loginError", "Please enter both email and password!");
      res.redirect('/login');
    } else {
      next();
    }
  }, passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login',
    failureFlash : true
  })
);
// set user routes
app.get('/users/new', function(req, res){
  res.render('users/new', {
    formData: req.flash('formData')[0],
    emailError: req.flash('emailError')[0],
    nicknameError: req.flash('nicknameError')[0],
    passwordError: req.flash('passwordError')[0]
  });
}); // new
app.post('/users', checkUserRegValidation, function(req,res,next){
  User.create(req.body.user, function(err, user){
    if(err) return res.json({success:false, message:err});
    res.redirect('/login');
  });
}); // create
app.get('/users/:id', isLoggedIn, function(req, res){
//app.get('/users/:id', function(req, res){
  User.findById(req.params.id, function(err, user){
    if(err) return res.json({success:false, message:err});
    res.render('users/show', {user: user});
  });
}); // show
app.get('/users/:id/edit', isLoggedIn, function(req, res){
//app.get('/users/:id/edit', function(req, res){
  if(req.user._id != req.params.id) return res.json({success:false, message:"Unauthorized Attempt"});
  User.findById(req.params.id, function(err, user){
    if(err) res.json({success:false, message:user});
    res.render('users/edit', {user:user,
                              formData:req.flash('formData')[0],
                              emailError:req.flash('emailError')[0],
                              nicknameError:req.flash('nicknameError')[0],
                              passwordError:req.flash('passwordError')[0]});
  });
}); // edit
app.put('/users/:id', isLoggedIn, checkUserRegValidation, function(req,res){
//app.put('/users/:id', checkUserRegValidation, function(req,res){
  if(req.user._id != req.params.id) return res.json({success:false, message:"Unauthorized Attempt"});
  User.findById(req.params.id, req.body.user, function(err, user){
    if(err) return res.json({success:false, message:err});
    if(user.authenticate(req.body.user.password)){
      if(req.body.user.newPassword){
        user.password = req.body.user.newPassword;
        user.save();
      } else {
        delete req.body.user.password;
      }
      User.findByIdAndUpdate(req.params.id, req.body.user, function(err, user){
        if(err) return res.json({success:false, message:err});
        res.redirect('/users/'+req.params.id);
      });
    } else {
      req.flash('formData', req.body.user);
      req.flash('passwordError', "- Invalid password");
      res.redirect('/users/'+req.params.id+"/edit");
    }
  });
});
// set routes
app.get('/posts', function(req, res){
  Post.find({}).sort('-createdAt').exec(function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/index", {data:post, user:req.user});
  });
}); // index
// app.get('/posts', function(req, res){
//   Post.find({}, function(err, post){
//     res.json({success:true, data:post});
//   }).sort({createdAt: 1});
// }); // index
app.get('/posts/new', function(req, res){
  res.render("posts/new");
}); // new
app.get('/posts/:id', function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    //console.log({data:post});
    res.render("posts/show", {data:post});
  });
}); // show
app.get('/posts/:id/edit', function(req, res){
  Post.findById(req.params.id, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/edit", {data:post});
  });
}); // edit

app.post('/posts', function(req, res){
  console.log(req.body);
  Post.create(req.body.post, function(err, post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });
}); // create
// app.post('/posts', function(req, res){
//   Post.create(req.body.post, function(err, post){
//     if(err) return res.json({success:false, message:err});
//     res.json({success:true, data:post});
//   });
// }); // create
app.delete('/posts/:id', function(req, res) {
  Post.findByIdAndRemove(req.params.id, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });
}); // destroy
// app.delete('/posts/:id', function(req, res) {
//   Post.findByIdAndRemove(req.params.id, function(err, post) {
//     res.json({success:true, message:post._id+" deleted"});
//   });
// }); // destroy
app.put('/posts/:id', function(req, res) {
  req.body.post.updatedAt = Date.now();
  Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts/'+req.params.id);
  });
}); // update
// app.put('/posts/:id', function(req, res) {
//   req.body.post.updatedAt = Date.now();
//   Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post) {
//     res.json({success:true, message:post._id+" updated"});
//   });
// }); // update
app.delete('/posts/:id', function(req, res) {
  Post.findByIdAndRemove(req.params.id, function(err, post) {
    res.json({success:true, message:post._id+" deleted"});
  });
}); // destroy
// functions
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function checkUserRegValidation(req, res, next) {
  var isValid = true;

  async.waterfall(
    [function(callback) {
      User.findOne({email:req.body.user.email, _id: {$ne: mongoose.Types.ObjectId(req.params.id)}},
        function(err, user){
          if(user){
            isValid = false;
            req.flash("emailError", "- This email is already registered.");
          }
          callback(null, isValid);
        });
    }, function(isValid, callback) {
        User.findOne({nickname: req.body.user.nickname, _id: {$ne: mongoose.Types.ObjectId(req.params.id)}},
        function(err, user){
          if(user){
            isValid = false;
            req.flash("nicknameError", "- This nickname is already registered.");
          }
          callback(null, isValid);
        });
    }], function(err, isValid) {
      if(err) return res.json({success:false, message:err});
      if(isValid){
        return next();
      } else {
        req.flash("formData", req.body.user);
        req.redirect("back");
      }
    }
  );
}
// var dataSchema = mongoose.Schema({
//   name : String,
//   count : Number
// });
// var Data = mongoose.model('data', dataSchema);
// Data.findOne({name:"myData"}, function(err, data){
//   if(err) return console.log("Data ERROR:", err);
//   if(!data){
//     Data.create({name:"myData", count:0}, function(err, data){
//       if(err) return console.log("Data ERROR:", err);
//       console.log("Counter initialized :", data);
//     });
//   }
// });


/*
//var data = {count:0};
app.get('/', function(req, res) {
  Data.findOne({name:"myData"}, function(err, data){
    if(err) return console.log("Data ERROR:", err);
    data.count++;
    data.save(function (err) {
      if(err) return console.log("Data ERROR:", err);
      res.render('my_first_ejs', data);
    });
  });
});
// app.get('/', function(req, res) {
//   data.count++;
//   res.render('my_first_ejs', data);
// });
app.get('/reset', function(req, res) {
  setCounter(res, 0);
});
app.get('/set/count', function(req, res) {
  if(req.query.count) setCounter(res, req.query.count);
  else getCounter(res);
});
app.get('/set/:num', function(req, res) {
  if(req.params.num) setCounter(res, req.params.num);
  else getCounter(res);
});

function setCounter(res, num) {
  console.log("<<<SetCounter>>>");
  Data.findOne({name:"myData"}, function(err, data){
    if(err) return console.log("DATA ERROR:", err);
    data.count = num;
    data.save(function(err){
      if(err) return console.log("DATA ERROR:", err);
      res.render('my_first_ejs', data);
    });
  });
}
function getCounter(res) {
  console.log("<<<GetCounter>>>");
  Data.findOne({name:"myData"}, function(err, data){
    if(err) return console.log("DATA EROR", err);
    res.render('my_first_ejs', data);
  });
}
//app.use(express.static(path.join(__dirname, '/views')));
//app.use(express.static(__dirname + '/public'));
//console.log(path.join(__dirname, '/views'));

// app.get('/', function (req, res) {
//   res.render('my_first_ejs');
// });
// app.get('/',function (req, res) {
//   res.send('Hello World!');
// });
*/
// start server
app.listen(3000, function() {
  console.log('Server On!');
});

/*function fizzbuzz() {
  for(var i=0; i< 100; i++) {
    if(i % 3 == 0 && i % 5 == 0) {
      console.log("FizzBuzz");
    }else if(i % 3 == 0) {
       console.log("Fizz");
    }else(i % 5 == 0) {
      console.log("Buzz");
    }
  }

}
*/
