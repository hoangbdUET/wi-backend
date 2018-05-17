module.exports.exportData = function (inputStream, cbForResult, option) {
    XLSX = require('xlsx');
    let fs = require('fs');
    let tempfile = require('tempfile')('.xlsx');


    let arrData = [];
    let lineReader = require('readline').createInterface({
        // input: require('fs').createReadStream('ECGR.txt')
        input: inputStream
    });


    lineReader.on('line', function (line) {
        let arrXY = line.split(/\s+/g).slice(1, 2);
        arrData.push(arrXY);
    });
    lineReader.on('close', function () {
        let ws = XLSX.utils.aoa_to_sheet(arrData);
        let wb = {SheetNames: [], Sheets: {}};
        wb.SheetNames.push("curve");
        wb.Sheets["curve"] = ws;
        XLSX.writeFile(wb, tempfile);
        cbForResult(200, tempfile);
    });
};
