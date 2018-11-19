module.exports = function (srcUnit, desUnit, inValue) {
    let s1 = JSON.parse(srcUnit.rate);
    let s2 = JSON.parse(desUnit.rate);
    return (parseFloat(inValue) - s1[1]) * (s2[0] / s1[0]) + s2[1];
};