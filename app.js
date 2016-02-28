var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB);

var db = mongoose.connection;
db.once("open", function() {
  console.log("DB connected!");
});
db.on("error", function(err) {
  console.log("DB ERROR : ", err);
});

var dataSchema = mongoose.Schema({
  name : String,
  count : Number
});
var Data = mongoose.model('data', dataSchema);
// Data.findOne({name:"myData"}, function(err, data){
//   if(err) return console.log("Data ERROR:", err);
//   if(!data){
//     Data.create({name:"myData", count:0}, function(err, data){
//       if(err) return console.log("Data ERROR:", err);
//       console.log("Counter initialized :", data);
//     });
//   }
// });

app.set("view engine", 'ejs');

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
