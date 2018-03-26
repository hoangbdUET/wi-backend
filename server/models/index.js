"use strict";
let modelMaster = require('../models-master/index');
let User = modelMaster.User;
let Sequelize = require('sequelize');
let config = require('config').Database;
let configCommon = require('config');

let wiImport = require('wi-import');
let hashDir = wiImport.hashDir;

let sequelizeCache = new Object();

function SequelizeCache() {
}

SequelizeCache.prototype.put = function (dbName, dbInstance) {
    this[dbName] = dbInstance;
}

SequelizeCache.prototype.get = function (dbName) {
    return this[dbName];
}

SequelizeCache.prototype.remove = function (dbName) {
    delete this[dbName];
}

let __CACHE = new SequelizeCache();
//console.log('start batch job', __CACHE);
setInterval(function () {
    //watchDog
    Object.keys(__CACHE).forEach(function (cache) {
        let dbConnect = __CACHE.get(cache);
        if (Date.now() - dbConnect.timestamp > 1000 * 15 * 60) {
            //delete cache and close sequelize connection if not working for 5 mins
            __CACHE.remove(cache);
            console.log("CLOSED CONNECTION TO : " + cache);
            try {
                dbConnect.instance.sequelize.close();
            } catch (err) {
                console.log("ERR WHILE CLOSE INSTANCE");
            }
        }
    });
}, 1000 * 60);
module.exports = function (dbName, callback, isDelete) {
    if (isDelete) {
        return __CACHE.remove(dbName);
    } else {
        let cacheItem = __CACHE.get(dbName);
        if (cacheItem) {
            cacheItem.timestamp = Date.now();
            return cacheItem.instance;
        } else {
            // No existing dbInstance in the __CACHE ! Create a new one
            cacheItem = {
                instance: null,
                timestamp: Date.now()
            }
            cacheItem.instance = newDbInstance(dbName, callback);
            __CACHE.put(dbName, cacheItem);
            console.log("START CONNECT TO : ", dbName);
            return cacheItem.instance;
        }
    }
}

function newDbInstance(dbName, callback) {
    let object = new Object();
    const sequelize = new Sequelize(dbName, config.user, config.password, {
        define: {
            freezeTableName: true
        },
        dialect: config.dialect,
        port: config.port,
        logging: config.logging,
        dialectOptions: {
            charset: 'utf8'
        },
        paranoid: true,
        pool: {
            max: 2,
            min: 0,
            idle: 200
        },
        operatorsAliases: Sequelize.Op,
        storage: config.storage
    });
    sequelize.sync()
        .catch(function (err) {
            //console.log(err.message);
            callback(err);
        });

    let models = [
        'Annotation',
        'CombinedBox',
        'CombinedBoxTool',
        'CrossPlot',
        'Curve',
        'Dataset',
        'DepthAxis',
        'Family',
        'FamilyCondition',
        'FamilySpec',
        'Groups',
        'Histogram',
        'Image',
        'ImageOfTrack',
        'ImageTrack',
        'Line',
        'Marker',
        'ObjectOfTrack',
        'ObjectTrack',
        'OverlayLine',
        'Plot',
        'PointSet',
        'Polygon',
        'Project',
        'Property',
        'ReferenceCurve',
        'RegressionLine',
        'SelectionTool',
        'Shading',
        'Ternary',
        'Track',
        'UserDefineLine',
        'Well',
        'WellHeader',
        'Workflow',
        'WorkflowSpec',
        'Zone',
        'ZoneSet',
        'ZoneTrack'
    ];
    models.forEach(function (model) {
        object[model] = sequelize.import(__dirname + '/' + model);
    });

    (function (m) {
        m.Project.hasMany(m.Well, {
            foreignKey: {
                name: "idProject",
                allowNull: false,
                unique: "name-idProject"
            }, onDelete: 'CASCADE'
        });
        m.Project.hasMany(m.Groups, {
            foreignKey: {
                name: "idProject",
                allowNull: false,
                unique: "name-idProject"
            }, onDelete: 'CASCADE'
        });
        m.Groups.hasMany(m.Well, {
            foreignKey: {
                name: "idGroup",
                allowNull: true
            }
        });

        m.Groups.hasMany(m.Groups, {
            foreignKey: {
                name: "idParent",
                allowNull: true
            }, onDelete: 'CASCADE'
        });

        m.Well.hasMany(m.Dataset, {
            foreignKey: {
                name: "idWell",
                allowNull: false,
                unique: "name-idWell"
            }, onDelete: 'CASCADE', hooks: true
        });
        m.Well.hasMany(m.Plot, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.ZoneSet, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.CrossPlot, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.Histogram, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.CombinedBox, {
            foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"},
            onDelete: 'CASCADE'
        });
        m.Well.hasMany(m.WellHeader, {
            foreignKey: {name: "idWell", allowNull: false},
            onDelete: 'CASCADE'
        });

        m.Dataset.hasMany(m.Curve, {
            foreignKey: {
                name: "idDataset",
                allowNull: false,
                unique: "name-idDataset"
            }, onDelete: 'CASCADE', hooks: true
        });
        m.Plot.hasMany(m.Track, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.Plot.hasMany(m.DepthAxis, {
            foreignKey: {name: "idPlot", allowNull: false},
            onDelete: 'CASCADE'
        });
        m.Plot.hasMany(m.ImageTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.ImageTrack.hasMany(m.ImageOfTrack, {
            foreignKey: {name: "idImageTrack", allowNull: false},
            onDelete: 'CASCADE'
        });
        m.Plot.hasMany(m.ObjectTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.ObjectTrack.hasMany(m.ObjectOfTrack, {
            foreignKey: {name: "idObjectTrack", allowNull: false},
            onDelete: 'CASCADE'
        });
        m.Plot.hasMany(m.ZoneTrack, {foreignKey: {name: "idPlot", allowNull: false}, onDelete: 'CASCADE'});
        m.ZoneTrack.belongsTo(m.ZoneSet, {foreignKey: {name: "idZoneSet", allowNull: true}});//TODO allowNull??
        m.ZoneSet.hasMany(m.Zone, {foreignKey: {name: "idZoneSet", allowNull: false}, onDelete: 'CASCADE'});
        m.Plot.belongsTo(m.Curve, {foreignKey: 'referenceCurve'});

        m.Track.hasMany(m.Line, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Shading, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Image, {foreignKey: {name: "idTrack", allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Marker, {foreignKey: {name: 'idTrack', allowNull: false}, onDelete: 'CASCADE'});
        m.Track.hasMany(m.Annotation, {foreignKey: {name: 'idTrack', allowNull: false}, onDelete: 'CASCADE'});
        m.Line.belongsTo(m.Curve, {foreignKey: {name: "idCurve", allowNull: false}, onDelete: 'CASCADE'});

        m.FamilyCondition.belongsTo(m.Family, {foreignKey: 'idFamily'});
        m.Family.hasMany(m.FamilySpec, {as: 'family_spec', foreignKey: 'idFamily'});
        m.Curve.belongsTo(m.Family, {as: 'LineProperty', foreignKey: 'idFamily'});

        m.Shading.belongsTo(m.Line, {foreignKey: 'idLeftLine', as: 'leftLine', onDelete: 'CASCADE'});
        m.Shading.belongsTo(m.Line, {foreignKey: 'idRightLine', as: 'rightLine', onDelete: 'CASCADE'});
        m.Shading.belongsTo(m.Curve, {foreignKey: 'idControlCurve'});

        m.CrossPlot.hasMany(m.Polygon, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
        m.CrossPlot.hasMany(m.RegressionLine, {
            foreignKey: {name: 'idCrossPlot', allowNull: false},
            onDelete: 'CASCADE'
        });
        m.CrossPlot.hasMany(m.ReferenceCurve, {
            foreignKey: {name: 'idCrossPlot', allowNull: true},
            onDelete: 'CASCADE'
        });
        m.CrossPlot.hasMany(m.Ternary, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
        m.CrossPlot.hasMany(m.PointSet, {foreignKey: {name: 'idCrossPlot', allowNull: false}, onDelete: 'CASCADE'});
        m.CrossPlot.hasMany(m.UserDefineLine, {
            foreignKey: {
                name: 'idCrossPlot',
                allowNull: false,
                onDelete: 'CASCADE'
            }
        });

        m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveX', allowNull: true}});
        m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveY', allowNull: true}});
        m.PointSet.belongsTo(m.Curve, {foreignKey: {name: 'idCurveZ', allowNull: true}});
        m.PointSet.belongsTo(m.Well, {foreignKey: {name: 'idWell', allowNull: false}, onDelete: 'CASCADE'});
        m.PointSet.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
        m.PointSet.belongsTo(m.OverlayLine, {foreignKey: {name: 'idOverlayLine', allowNull: true}});


        m.Histogram.belongsTo(m.Curve, {foreignKey: 'idCurve'});
        m.Histogram.belongsTo(m.ZoneSet, {foreignKey: {name: 'idZoneSet', allowNull: true}});
        m.Histogram.hasMany(m.ReferenceCurve, {
            foreignKey: {name: 'idHistogram', allowNull: true},
            onDelete: 'CASCADE'
        });

        m.Polygon.belongsToMany(m.RegressionLine, {
            through: 'Polygon_RegressionLine',
            foreignKey: 'idPolygon'
        });
        m.RegressionLine.belongsToMany(m.Polygon, {
            through: 'Polygon_RegressionLine',
            foreignKey: 'idRegressionLine'
        });
        //combined box
        m.CombinedBox.hasMany(m.CombinedBoxTool, {
            foreignKey: {name: "idCombinedBox", allowNull: true},
            onDelete: 'CASCADE'
        });
        m.CombinedBox.belongsToMany(m.Plot, {
            through: 'combined_box_plot',
            foreignKey: 'idCombinedBox'
        });
        m.CombinedBox.belongsToMany(m.CrossPlot, {
            through: 'combined_box_crossplot',
            foreignKey: 'idCombinedBox'
        });
        m.CombinedBox.belongsToMany(m.Histogram, {
            through: 'combined_box_histogram',
            foreignKey: 'idCombinedBox'
        });
        m.Plot.belongsToMany(m.CombinedBox, {
            through: 'combined_box_plot',
            foreignKey: 'idPlot'
        });
        m.CrossPlot.belongsToMany(m.CombinedBox, {
            through: 'combined_box_crossplot',
            foreignKey: 'idCrossPlot'
        });
        m.Histogram.belongsToMany(m.CombinedBox, {
            through: 'combined_box_histogram',
            foreignKey: 'idHistogram'
        });

        //end combined box
        m.ReferenceCurve.belongsTo(m.Curve, {
            foreignKey: {name: 'idCurve', allowNull: false},
            onDelete: 'CASCADE'
        });

        m.CombinedBox.hasMany(m.SelectionTool, {
            foreignKey: {name: 'idCombinedBox', allowNull: false},
            onDelete: 'CASCADE'
        });
        m.CombinedBoxTool.hasOne(m.SelectionTool, {
            foreignKey: {name: 'idCombinedBoxTool', allowNull: false},
            onDelete: 'CASCADE'
        });

        // m.Project.hasMany(m.WorkflowSpec, {
        //     foreignKey: {name: 'idProject', allowNull: false},
        //     onDelete: 'CASCADE'
        // });
        m.Project.hasMany(m.Workflow, {
            foreignKey: {name: 'idProject', allowNull: false, unique: 'name-idProject'},
            onDelete: 'CASCADE'
        });
        m.Plot.hasOne(m.Workflow, {
            foreignKey: {name: 'idPlot', allowNull: true}
        });
        m.WorkflowSpec.hasMany(m.Workflow, {
            foreignKey: {name: 'idWorkflowSpec', allowNull: true},
            onDelete: 'CASCADE'
        });
    })(object);

    object.sequelize = sequelize;
    //Register hook
    let FamilyCondition = object.FamilyCondition;
    let Dataset = object.Dataset;
    let Well = object.Well;
    let WellHeader = object.WellHeader;
    let Curve = object.Curve;
    let Project = object.Project;
    let Histogram = object.Histogram;
    let CrossPlot = object.CrossPlot;
    let Plot = object.Plot;
    let ZoneSet = object.ZoneSet;
    let Zone = object.Zone;
    let username = dbName.substring(dbName.indexOf("_") + 1);
    Curve.hook('afterCreate', function (curve, options) {
        if (!curve.idFamily) {
            ((curveName, unit) => {
                FamilyCondition.findAll()
                    .then(conditions => {
                        let result = conditions.find(function (aCondition) {
                            let regex;
                            try {
                                regex = new RegExp("^" + aCondition.curveName + "$", "i").test(curveName) && new RegExp("^" + aCondition.unit + "$", "i").test(unit);
                            } catch (err) {
                                console.log(err);
                            }
                            return regex;
                        });
                        if (!result) {
                            return;
                        }
                        result.getFamily()
                            .then(aFamily => {
                                curve.setLineProperty(aFamily);
                            })
                    })
            })(curve.name, curve.unit);
        }
    });
    Curve.hook('beforeDestroy', function (curve, options) {
        Dataset.findById(curve.idDataset, {paranoid: false}).then(dataset => {
            Well.findById(dataset.idWell, {paranoid: false}).then(well => {
                Project.findById(well.idProject).then(project => {
                    if (curve.deletedAt) {
                        hashDir.deleteFolder(configCommon.curveBasePath, username + project.name + well.name + dataset.name + curve.name.substring(14));
                    } else {
                        hashDir.deleteFolder(configCommon.curveBasePath, username + project.name + well.name + dataset.name + curve.name);
                    }
                });
            });
        }).catch(err => {
            console.log("ERR WHILE DELETE CURVE : " + err);
        });
    });

    Well.hook('beforeDestroy', function (well, options) {
        console.log("Hooks delete well");
        if (well.deletedAt) {

        } else {
            let time = Date.now();
            well.name = '$' + time + well.name;
            well.save().catch(err => {
                console.log(err);
            });
            //console.log(well.name);
        }
    });

    Well.hook('afterCreate', function (well, options) {
        console.log("Hook after create well");
        let headers = {
            STRT: well.topDepth,
            STOP: well.bottomDepth,
            STEP: well.step,
            TOP: well.topDepth
        };
        for (let header in headers) {
            WellHeader.create({idWell: well.idWell, header: header, value: headers[header]});
        }
    });

    Well.hook('beforeUpdate', async function (well, options) {
        console.log("Hook before update well");
        let headers = {
            STRT: well.topDepth,
            STOP: well.bottomDepth,
            STEP: well.step,
            TOP: well.topDepth
        };
        for (let header in headers) {
            let h = await WellHeader.findOne({where: {idWell: well.idWell, header: header}});
            if (h) {
                await h.update({value: headers[header]});
            } else {
                await WellHeader.create({header: header, value: headers[header], idWell: well.idWell})
            }
        }
    });
    Dataset.hook('beforeDestroy', function (dataset, options) {
        console.log("Hooks delete dataset");
        if (dataset.deletedAt) {

        } else {
            let time = Date.now();
            dataset.name = '$' + time + dataset.name;
            dataset.save().catch(err => {
                console.log(err);
            });
        }
    });

    Histogram.hook('beforeDestroy', function (histogram, options) {
        console.log("Hooks delete histogram");
        if (histogram.deletedAt) {

        } else {
            let time = Date.now();
            histogram.name = '$' + time + histogram.name;
            histogram.save().catch(err => {
                console.log(err);
            });
        }
    });

    CrossPlot.hook('beforeDestroy', function (crossplot, options) {
        console.log("Hooks delete crossplot");
        if (crossplot.deletedAt) {

        } else {
            let time = Date.now();
            crossplot.name = '$' + time + crossplot.name;
            crossplot.save().catch(err => {
                console.log(err);
            });
        }
    });

    Plot.hook('beforeDestroy', function (plot, options) {
        console.log("Hooks delete plot");
        if (plot.deletedAt) {

        } else {
            let time = Date.now();
            plot.name = '$' + time + plot.name;
            plot.save().catch(err => {
                console.log(err);
            });
        }
    });

    ZoneSet.hook('beforeDestroy', function (zoneset, options) {
        console.log("Hooks delete zoneset");
        if (zoneset.deletedAt) {

        } else {
            let time = Date.now();
            zoneset.name = '$' + time + zoneset.name;
            zoneset.save().catch(err => {
                console.log(err);
            });
        }
    });

    Zone.hook('beforeDestroy', function (zone, options) {
        console.log("Hooks delete zone");
        if (zone.deletedAt) {

        } else {
            let time = Date.now();
            zone.name = '$' + time + zone.name;
            zone.save().catch(err => {
                console.log(err);
            });
        }
    });
    //End register hook
    return object;
};
