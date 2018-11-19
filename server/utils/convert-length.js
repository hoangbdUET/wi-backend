const length = {
    ".0005 M": 2000,
    ".01 M": 100,
    ".1IN": 10,
    "0.1 in": 10,
    "05mm": 2000,
    "1/32 in": 1259.84256,
    "angstrom": 10000000000,
    "bbl/acre": 25453.96,
    "ch": 0.0497096954,
    "chBnA": 0.049709739,
    "chBnB": 0.049709739,
    "ChCla": 0.0497101414329133,
    "chSe": 0.0497097815657,
    "chUS": 0.049709596,
    "CM": 100,
    "cm": 100,
    "CV": 0.0497096953789867,
    "deciin": 393.70079,
    "dm": 10,
    "F": 3.28084,
    "fathom": 0.54680665,
    "FEET": 3.28084,
    "feet": 3.28084,
    "fm": 999999999999999,
    "Ft": 3.28084,
    "ft": 3.28084,
    "ftBnA": 3.28084277,
    "ftBnB": 3.28084275,
    "ftBr(65)": 3.280831,
    "ftCla": 3.28086933,
    "ftGC": 3.2808430146,
    "ftInd": 3.280845167,
    "ftInd(37)": 3.28085701,
    "ftInd(62)": 3.2808442,
    "ftInd(75)": 3.280845277,
    "ftMA": 3.28070801,
    "ftSe": 3.28084559,
    "ftUS": 3.28083333,
    "IN": 39.370079,
    "in": 39.370079,
    "in/10": 393.70079,
    "in/16": 629.921264,
    "in/32": 1259.842528,
    "in/64": 2519.685056,
    "inches": 39.370079,
    "inch": 39.370079,
    "ins": 39.370079,
    "inUS": 39.37,
    "KM": 0.001,
    "km": 0.001,
    "lkBnA": 4.97097389,
    "lkBnB": 4.97097389,
    "lkCla": 4.971014137,
    "lkSe": 4.970978157,
    "lkUS": 4.9709596,
    "M": 1,
    "m": 1,
    "m3/m2": 1,
    "meter": 1,
    "meters": 1,
    "METRES": 1,
    "mGer": 0.9999864,
    "mi": 0.0006213712,
    "mil": 39370.079,
    "miUS": 0.00062137,
    "mm": 1000,
    "Mm": 0.000001,
    "nautmi": 0.00053996,
    "nm": 1000000000,
    "pm": 1000000000000,
    "um": 1000000,
    "yd": 1.0936133,
    "ydBnA": 1.093614255,
    "ydBnB": 1.09361425,
    "ydCla": 1.09362311,
    "ydIm": 1.09362311152409,
    "ydInd": 1.093615055556,
    "ydInd(37)": 1.093619,
    "ydInd(62)": 1.0936147336,
    "ydInd(75)": 1.0936151,
    "ydSe": 1.09361519444
};

function convertDistance(inputValue, inputUnit, outputUnit) {
    let inputScale = length[inputUnit];
    let outputScale = length[outputUnit];
    if (inputScale && outputScale) {
        return inputValue * (outputScale / inputScale);
    } else {
        return 0;
    }
}

function getDistanceRate(inputUnit, outputUnit) {
    let inputScale = length[inputUnit];
    let outputScale = length[outputUnit];
    return outputScale / inputScale;
}

function getUnitTable () {
    return length;
}

module.exports = {
    convertDistance: convertDistance,
    getDistanceRate: getDistanceRate,
    getUnitTable: getUnitTable
};