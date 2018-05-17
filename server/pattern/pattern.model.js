let ResponseJSON = require('../response');
let errorCodes = require('../../error-codes').CODES;
let wiXLSX = require('../utils/xlsx');
let path = require('path');
let patternXLSX = path.join(__dirname, 'Pattern.xlsx');
let getListPattern = function (payload, done) {
    let rows = wiXLSX.getRows(patternXLSX, 'pattern').splice(1);
    let response = {};
    rows.forEach(function (row) {
        response[row[0]] = {
            full_name: row[1],
            src: '/pattern/' + row[0] + '.png'
        }
    });
    // response.sort((a, b) => {
    //     let nameA = a.name.toUpperCase();
    //     let nameB = b.name.toUpperCase();
    //     return nameA === nameB ? 0 : nameA > nameB ? 1 : -1;
    // });
    done(ResponseJSON(errorCodes.SUCCESS, "Successfull", response));
};

module.exports = {
    getListPattern: getListPattern
};