let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

// function createNewPointSet(pointSetInfo, done, dbConnection) {
//     let PointSet = dbConnection.PointSet;
//     let Well = dbConnection.Well;
//     Well.findById(pointSetInfo.idWell).then(well => {
//         if (pointSetInfo.idZoneSet) {
//             PointSet.sync()
//                 .then(function () {
//                     delete pointSetInfo.idPointSet;
//                     PointSet.build(pointSetInfo)
//                         .save()
//                         .then(function (aPointSet) {
//                             done(ResponseJSON(ErrorCodes.SUCCESS, "Create new pointset success", aPointSet));
//                         })
//                         .catch(function (err) {
//                             done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new pointset" + err));
//                         })
//                 }, function () {
//                     done(ResponseJSON(ErrorCodes.ERROR_SYNC_TABLE, "Connect to database fail or create table not success"));
//                 });
//         } else {
//             if (pointSetInfo.intervalDepthTop) {
//                 PointSet.create(pointSetInfo).then(rs => {
//                     done(ResponseJSON(ErrorCodes.SUCCESS, "Create new pointset success", rs));
//                 }).catch(err => {
//                     done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new pointset" + err));
//                 });
//             } else {
//                 delete pointSetInfo.idPointSet;
//                 pointSetInfo.intervalDepthTop = well.topDepth;
//                 pointSetInfo.intervalDepthBottom = well.bottomDepth;
//                 PointSet.create(pointSetInfo).then(rs => {
//                     done(ResponseJSON(ErrorCodes.SUCCESS, "Create new pointset success", rs));
//                 }).catch(err => {
//                     done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new pointset" + err));
//                 });
//
//             }
//         }
//     });
// }

function createNewPointSet(pointSetInfo, done, dbConnection) {
    dbConnection.PointSet.create(pointSetInfo).then(p => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Done", p));
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Error", err));
    })
}

function editPointSet(pointSetInfo, done, dbConnection) {
    delete pointSetInfo.createdBy;
    let PointSet = dbConnection.PointSet;
    PointSet.findById(pointSetInfo.idPointSet)
        .then(function (pointSet) {
            Object.assign(pointSet, pointSetInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit pointset success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit poinset" + err));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "PointSet not found for edit"));
        })
}

function deletePointSet(pointSetInfo, done, dbConnection) {
    let PointSet = dbConnection.PointSet;
    PointSet.findById(pointSetInfo.idPointSet)
        .then(function (pointSet) {
            pointSet.setDataValue('updatedBy', pointSetInfo.updatedBy);
            pointSet.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "PointSet is deleted", pointSet));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete PointSet " + err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "PointSet not found for delete"))
        })
}


function getPointSetInfo(pointSetInfo, done, dbConnection) {
    let PointSet = dbConnection.PointSet;
    PointSet.findById(pointSetInfo.idPointSet)
        .then(function (pointSet) {
            if (!pointSet) throw 'not exists';
            done(ResponseJSON(ErrorCodes.SUCCESS, "Get PointSetInfo success", pointSet));
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "PointSet not found for get info"))
        })
}

module.exports = {
    createNewPointSet: createNewPointSet,
    editPointSet: editPointSet,
    deletePointSet: deletePointSet,
    getPointSetInfo: getPointSetInfo
}
