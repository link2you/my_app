var express = require('express');

var app = express();

app.get('/',function (req, res) {
  res.send('Hello World!');
});

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
