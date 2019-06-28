module.exports = function extractArr(payload) {
    objLoad = [];
    for (let i in payload.attributes) {
        let temp = payload.attributes[i];
        if (temp.indexOf('id') == 0) {
            objLoad.push({
                type: temp.substr(2, temp.length-1),
                value: payload[temp]
            });
        }
    }
    return objLoad;
}