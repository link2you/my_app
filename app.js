// import modules
var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
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
// view setting
app.set("view engine", 'ejs');
// set middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
// set routes
app.get('/posts', function(req, res){
  Post.find({}).sort('-createdAt').exec(function(err, post){
    if(err) return res.json({success:false, message:err});
    res.render("posts/index", {data:post});
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
