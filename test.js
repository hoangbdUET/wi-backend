var loop = require('async/each');

let arr = [1, 2, 3, 4, 5, 6, 5, 7, 7, 7, 6, 7, 7, 7, 7, 7, 77, 7, 7, 4];
loop(arr, function (e, next) {
    console.log(e);
}, function (err) {

})