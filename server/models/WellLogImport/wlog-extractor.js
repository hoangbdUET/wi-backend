'use strict';

let LASExtractor = require('./extractors/las-extractor');
let CSVExtractor = require('./extractors/csv-extractor');

module.exports.extractCurvesFromLAS = LASExtractor.extractCurves;
module.exports.extractWellFromLAS = LASExtractor.extractWell;

module.exports.extractCurvesFromCSV = CSVExtractor.extractCurves;