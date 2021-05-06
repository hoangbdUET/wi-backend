let checkPerm = require('../utils/permission/check-permisison');
module.exports = function (dbConnection) {
    dbConnection.ParameterSet.addHook('beforeCreate', function (object, options) {
        return new Promise(function (resolve, reject) {
            let permObj = 'parameter-set.create';
            let mess = "ParameterSet: Do not have permission";
            if (object.type === "CROSSPLOT") {
                permObj = 'cross-plot.create';
                mess = "CrossPlot: Do not have permission";
            }
            if (object.type === "HISTOGRAM") {
                permObj = 'histogram.create';
                mess = "Histogram: Do not have permission";
            }
            checkPerm(object.updatedBy, permObj, function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: mess });
                }
            });
        });
    });
    dbConnection.ParameterSet.addHook('beforeDestroy', function (object, options) {
        return new Promise(function (resolve, reject) {
            let permObj = 'parameter-set.delete';
            let mess = "ParameterSet: Do not have permission";
            if (object.type === "CROSSPLOT") {
                permObj = 'cross-plot.delete';
                mess = "CrossPlot: Do not have permission";
            }
            if (object.type === "HISTOGRAM") {
                permObj = 'histogram.create';
                mess = "Histogram: Do not have permission";
            }
            checkPerm(object.updatedBy, permObj, function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: mess });
                }
            });
        });
    });
    dbConnection.ParameterSet.addHook('beforeUpdate', function (object, options) {
        return new Promise(function (resolve, reject) {
            let permObj = 'parameter-set.update';
            let mess = "ParameterSet: Do not have permission";
            if (object.type === "CROSSPLOT") {
                permObj = 'cross-plot.update';
                mess = "CrossPlot: Do not have permission";
            }
            if (object.type === "HISTOGRAM") {
                permObj = 'histogram.update';
                mess = "Histogram: Do not have permission";
            }
            checkPerm(object.updatedBy, permObj, function (result) {
                if (result) {
                    resolve(object, options);
                } else {
                    reject({ message: mess });
                }
            });
        });
    });
};