module.exports = {
    isEqualBoth: function(obj1, obj2) {
        if (obj1.temp == obj2.temp && obj1.value == obj2.value) {
            return true;
        }
        return false;
    },
    isEqualValue: function(obj1, obj2) {
        if (obj1.value == obj2.value) {
            return true;
        }
        return false;
    }
}