var models = require('../models');
var Well = models.Well;

function createNewWell(wellInfo, done) {
    Well.sync()
        .then(
            function () {
                var well = Well.build({
                    idProject: wellInfo.idProject,
                    name: wellInfo.name,
                    topDepth:wellInfo.topDepth,
                    bottomDepth:wellInfo.bottomDepth,
                    step:wellInfo.step
                });
                well.save()
                    .then(function (well) {
                        done({id: well.idWell});
                    })
                    .catch(function (err) {
                        done({status: err});
                    });
            },
            function (err) {
                done({status:err});
            }
        )

}
function editWell(wellInfo, done) {
    Well.update({
        idProject: wellInfo.idProject,
        name: wellInfo.name,
        topDepth: wellInfo.topDepth,
        bottomDepth: wellInfo.bottomDepth,
        step: wellInfo.step
        }, {
        where: {idWell: wellInfo.idWell}
        })
        .then(function () {
            done({id: wellInfo.idWell, status: "changed"});
        })
        .catch(function (err) {
            done({id: wellInfo.idWell, status: err});
        });
}
function deleteWell(wellInfo,done) {

}
var wellEx = {
    "idProject": 1,
    "type": "well",
    "name": "Ex-Well",
    "topDepth": "10",
    "bottomDepth": "50",
    "step": "30"
};
// createNewWell(wellEx);
module.exports = {
    createNewWell:createNewWell,
    editWell:editWell,
    deleteWell:deleteWell
};