let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;
let asyncEach = require('async/each');

function genColor() {
    let rand = function () {
        return Math.floor(Math.random() * 255);
    };
    return "rgb(" + rand() + "," + rand() + "," + rand() + ")";
}

async function executeJob(data, cb, dbConnection) {
    try {
        let response = [];
        let project = await dbConnection.Project.findOne({where: {name: data.project}});
        if (!project) return cb(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No project found"));
        asyncEach(data.wells, function (well, next) {
            dbConnection.Well.findOne({where: {name: well.name, idProject: project.idProject}}).then(wiWell => {
                if (!wiWell) {
                    response.push({well: well.name, result: "Not found"});
                    next();
                } else {
                    dbConnection.ZoneSet.findOrCreate({
                        where: {
                            idWell: wiWell.idWell,
                            name: "default_zone_set"
                        }, defaults: {
                            idWell: wiWell.idWell,
                            name: "default_zone_set"
                        }
                    }).then(zs => {
                        let zoneset = zs[0];
                        for (let i = 0; i < well.depths.length; i++) {
                            if (well.depths[i] && well.depths[i + 1]) {
                                dbConnection.Zone.findOrCreate({
                                    where: {
                                        name: well.depths[i],
                                        idZoneSet: zoneset.idZoneSet,
                                        startDepth: parseFloat(well.depths[i])
                                    },
                                    defaults: {
                                        name: well.depths[i],
                                        idZoneSet: zoneset.idZoneSet,
                                        startDepth: parseFloat(well.depths[i]),
                                        endDepth: parseFloat(well.depths[i + 1]),
                                        fill: JSON.stringify({
                                            "pattern": {
                                                "background": genColor(),
                                                "foreground": "white",
                                                "name": "none"
                                            }
                                        })
                                    }
                                }).then(zone => {
                                }).catch(err => {
                                    console.log(err);
                                });
                            }
                        }
                        response.push({well: well.name, result: "Successful"});
                        next();
                    });
                }
            });
        }, function () {
            cb(ResponseJSON(ErrorCodes.SUCCESS, "Done", response));
        });
    } catch (e) {
        console.log(e);
        cb(ResponseJSON(ErrorCodes.SUCCESS, "Got error", e));
    }
}

module.exports = {
    executeJob: executeJob
}