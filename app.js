var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, '/public')));
//app.use(express.static(__dirname + '/public'));
// console.log(__dirname);


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
