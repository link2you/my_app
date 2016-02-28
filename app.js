var express = require('express');
var path = require('path');
var app = express();

app.set("view engine", 'ejs');

var data = {count:0};
app.get('/', function(req, res) {
  data.count++;
  res.render('my_first_ejs', data);
});
app.get('/reset', function(req, res) {
  data.count = 0;
  res.render('my_first_ejs', data);
});
app.get('/set/count', function(req, res) {
  if(req.query.count) data.count = req.query.count;
  res.render('my_first_ejs', data);
});
app.get('/set/:num', function(req, res) {
  data.count = req.params.num;
  res.render('my_first_ejs', data);
});
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
