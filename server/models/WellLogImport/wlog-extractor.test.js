let wlogExtractor = require('./wlog-extractor');
let url = process.argv[2];
wlogExtractor.extractCurvesFromLAS(url);
wlogExtractor.extractWellFromLAS(url);
//wlogExtractCurves.extractCurvesFromCSV(url);