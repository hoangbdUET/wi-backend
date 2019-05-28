let relations = [{
    source: 'Project',
    target: 'Well',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'Groups',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'StorageDatabase',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Groups',
    target: 'Well',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idGroup",
            allowNull: true
        }
    }
}, {
    source: 'Groups',
    target: 'Groups',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idParent",
            allowNull: true
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Well',
    target: 'Dataset',
    type: 'hasMany',
    options: {
        fforeignKey: {
            name: "idWell",
            allowNull: false,
            unique: "name-idWell"
        },
        onDelete: 'CASCADE',
        hooks: true
    }
}, {
    source: 'Project',
    target: 'Plot',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Well',
    target: 'ZoneSet',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idWell",
            allowNull: false,
            unique: "name-idWell"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ZoneSet',
    target: 'Well',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idWell",
            allowNull: false,
            unique: "name-idWell"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'CrossPlot',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'Histogram', 
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'CombinedBox',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CombinedBox',
    target: 'Project',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: false,
            unique: "name-idProject"
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Well',
    target: 'WellHeader',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idWell",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Dataset',
    target: 'Curve',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idDataset",
            allowNull: false,
            unique: "name-idDataset"
        },
        onDelete: 'CASCADE',
        hooks: true
    }
}, {
    source: 'Dataset',
    target: 'DatasetParams',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idDataset",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'Track',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idPlot",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'DepthAxis',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idPlot",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'ImageTrack',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idPlot",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ImageTrack',
    target: 'ImageOfTrack',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idImageTrack",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'ObjectTrack',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idPlot",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ObjectTrack',
    target: 'ObjectOfTrack',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idObjectTrack",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'ZoneTrack',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idPlot",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ZoneTrack',
    target: 'ZoneSet',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idZoneSet",
            allowNull: true
        }
    }
}, {
    source: 'Project',
    target: 'ZoneSetTemplate',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: true,
            unique: "name-idProject"
        },
        onDelete: "CASCADE"
    }
}, {
    source: 'ZoneSetTemplate',
    target: 'ZoneTemplate',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idZoneSetTemplate",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ZoneSet',
    target: 'ZoneSetTemplate',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idZoneSetTemplate",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'MarkerSet',
    target: 'MarkerSetTemplate',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idMarkerSetTemplate",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Zone',
    target: 'ZoneTemplate',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idZoneTemplate",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ZoneSet',
    target: 'Zone',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idZoneSet",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: 'referenceCurve'
    }
}, {
    source: 'Track',
    target: 'Line',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idTrack",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Track',
    target: 'Shading',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idTrack",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Track',
    target: 'Annotation',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idTrack',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Line',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: "idCurve",
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'FamilyCondition',
    target: 'Family',
    type: 'belongsTo',
    options: {
        foreignKey: 'idFamily'
    }
}, {
    source: 'Family',
    target: 'FamilySpec',
    type: 'hasMany',
    options: {
        as: 'family_spec',
        foreignKey: 'idFamily'
    }
}, {
    source: 'FamilySpec',
    target: 'UnitGroup',
    type: 'belongsTo',
    options: {
        foreignKey: 'idUnitGroup'
    }
}, {
    source: 'UnitGroup',
    target: 'FamilyUnit',
    type: 'hasMany',
    options: {
        foreignKey: 'idUnitGroup'
    }
}, {
    source: 'Curve',
    target: 'Family',
    type: 'belongsTo',
    options: {
        as: 'LineProperty',
        foreignKey: 'idFamily'
    }
}, {
    source: 'Shading',
    target: 'Line',
    type: 'belongsTo',
    options: {
        foreignKey: 'idLeftLine',
        as: 'leftLine',
        onDelete: 'CASCADE'
    }
}, {
    source: 'Shading',
    target: 'Line',
    type: 'belongsTo',
    options: {
        foreignKey: 'idRightLine',
        as: 'rightLine',
        onDelete: 'CASCADE'
    }
}, {
    source: 'Shading',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: 'idControlCurve'
    }
}, {
    source: 'CrossPlot',
    target: 'Polygon',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCrossPlot',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CrossPlot',
    target: 'RegressionLine',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCrossPlot',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CrossPlot',
    target: 'ReferenceCurve',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCrossPlot',
            allowNull: true
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CrossPlot',
    target: 'Ternary',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCrossPlot',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CrossPlot',
    target: 'PointSet',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCrossPlot',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CrossPlot',
    target: 'UserDefineLine',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCrossPlot',
            allowNull: false,
            onDelete: 'CASCADE'
        }
    }
}, {
    source: 'PointSet',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurveX',
            allowNull: true
        }
    }
}, {
    source: 'PointSet',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurveY',
            allowNull: true
        }
    }
}, {
    source: 'PointSet',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurveZ',
            allowNull: true
        }
    }
}, {
    source: 'PointSet',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurveZ1',
            allowNull: true
        }
    }
}, {
    source: 'PointSet',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurveZ2',
            allowNull: true
        }
    }
}, {
    source: 'PointSet',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurveZ3',
            allowNull: true
        }
    }
}, {
    source: 'Histogram',
    target: 'Curve',
    type: 'belongsToMany',
    options: {
        through: 'histogram_curve_set',
        foreignKey: 'idHistogram'
    }
}, {
    source: 'Curve',
    target: 'Histogram',
    type: 'belongsToMany',
    options: {
        through: 'histogram_curve_set',
        foreignKey: 'idCurve'
    }
}, {
    source: 'Shading',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: 'idControlCurve'
    }
}, {
    source: 'Histogram',
    target: 'ZoneSet',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idZoneSet',
            allowNull: true
        }
    }
}, {
    source: 'Histogram',
    target: 'ReferenceCurve',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idHistogram',
            allowNull: true
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Polygon',
    target: 'RegressionLine',
    type: 'belongsToMany',
    options: {
        through: 'Polygon_RegressionLine',
        foreignKey: 'idPolygon'
    }
}, {
    source: 'RegressionLine',
    target: 'Polygon',
    type: 'belongsToMany',
    options: {
        through: 'Polygon_RegressionLine',
        foreignKey: 'idRegressionLine'
    }
}, {
    source: 'CombinedBox',
    target: 'CombinedBoxTool',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idCombinedBox",
            allowNull: true
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CombinedBox',
    target: 'Plot',
    type: 'belongsToMany',
    options: {
        through: 'combined_box_plot',
        foreignKey: 'idCombinedBox'
    }
}, {
    source: 'CombinedBox',
    target: 'CrossPlot',
    type: 'belongsToMany',
    options: {
        through: 'combined_box_crossplot',
        foreignKey: 'idCombinedBox'
    }
}, {
    source: 'CombinedBox',
    target: 'Histogram',
    type: 'belongsToMany',
    options: {
        through: 'combined_box_histogram',
        foreignKey: 'idCombinedBox'
    }
}, {
    source: 'Plot',
    target: 'CombinedBox',
    type: 'belongsToMany',
    options: {
        through: 'combined_box_plot',
        foreignKey: 'idPlot'
    }
}, {
    source: 'CrossPlot',
    target: 'CombinedBox',
    type: 'belongsToMany',
    options: {
        through: 'combined_box_crossplot',
        foreignKey: 'idCrossPlot'
    }
}, {
    source: 'Histogram',
    target: 'CombinedBox',
    type: 'belongsToMany',
    options: {
        through: 'combined_box_histogram',
        foreignKey: 'idHistogram'
    }
}, {
    source: 'CombinedBox',
    target: 'SelectionTool',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idCombinedBox',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'ReferenceCurve',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {
            name: 'idCurve',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'CombinedBoxTool',
    target: 'SelectionTool',
    type: 'hasOne',
    options: {
        foreignKey: {
            name: 'idCombinedBoxTool',
            allowNull: false
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'Workflow',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: 'idProject',
            allowNull: false,
            unique: 'name-idProject'
        },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'ParameterSet',
    type: 'hasMany',
    options: {
        foreignKey: { name: 'idProject', allowNull: false, unique: 'name-idProject' },
        onDelete: 'CASCADE'
    }
}, {
    source: 'Plot',
    target: 'Workflow',
    type: 'hasOne',
    options: {
        foreignKey: {name: 'idPlot', allowNull: true}
    }
}, {
    source: 'Track',
    target: 'ZoneSet',
    type: 'belongsTo',
    options: {
        foreignKey: {name: 'idZoneSet', allowNull: true}
    }
}, {
    source: 'ZoneSet',
    target: 'Track',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idZoneSet', allowNull: true}
    }
}, {
    source: 'Track',
    target: 'MarkerSet',
    type: 'belongsTo',
    options: {
        foreignKey: {name: 'idMarkerSet', allowNull: true}
    }
}, {
    source: 'MarkerSet',
    target: 'Track',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idMarkerSet', allowNull: true}
    }
}, {
    source: 'WorkflowSpec',
    target: 'Workflow',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idWorkflowSpec', allowNull: true},
			onDelete: 'CASCADE'
    }
}, {
    source: 'Project',
    target: 'Flow',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idProject', allowNull: true, unique: 'name-idProject'},
			onDelete: 'CASCADE'
    }
}, {
    source: 'Flow',
    target: 'Task',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idFlow', allowNull: false, unique: 'name-idFlow'},
        onDelete: 'CASCADE'
    }
}, {
    source: 'TaskSpec',
    target: 'Task',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idTaskSpec', allowNull: true},
			onDelete: 'CASCADE'
    }
}, {
    source: 'TaskSpec',
    target: 'ParameterSet',
    type: 'hasMany',
    options: {
        foreignKey: {name: 'idTaskSpec', allowNull: true},
			onDelete: 'CASCADE'
    }
}, {
    source: 'ParameterSet',
    target: 'TaskSpec',
    type: 'belongsTo',
    options: {
        foreignKey: {name: 'idTaskSpec', allowNull: true},
			onDelete: 'CASCADE'
    }
}, {
    source: 'Well',
    target: 'MarkerSet',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"}
    }
}, {
    source: 'MarkerSet',
    target: 'Well',
    type: 'belongsTo',
    options: {
        foreignKey: {name: "idWell", allowNull: false, unique: "name-idWell"}
    }
}, {
    source: 'Well',
    target: 'DepthAxis',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idWell", allowNull: true}
    }
}, {
    source: 'Project',
    target: 'MarkerSetTemplate',
    type: 'hasMany',
    options: {
        foreignKey: {
            name: "idProject",
            allowNull: true,
            unique: "name-idProject"
        }, 
        onDelete: 'CASCADE'
    }
}, {
    source: 'MarkerSetTemplate',
    target: 'MarkerTemplate',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idMarkerSetTemplate", allowNull: false, unique: "name-idMarkerSetTemplate"},
        onDelete: "CASCADE"
    }
}, {
    source: 'MarkerSetTemplate',
    target: 'MarkerSet',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idMarkerSetTemplate", allowNull: false},
			onDelete: "CASCADE"
    }
}, {
    source: 'Marker',
    target: 'MarkerTemplate',
    type: 'belongsTo',
    options: {
        foreignKey: {name: "idMarkerTemplate", allowNull: false}, onDelete: "CASCADE"
    }
}, {
    source: 'MarkerSet',
    target: 'Marker',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idMarkerSet", allowNull: false}
    }
}, {
    source: 'DepthAxis',
    target: 'Curve',
    type: 'belongsTo',
    options: {
        foreignKey: {name: "idCurve", allowNull: true}
    }
}, {
    source: 'Curve',
    target: 'DepthAxis',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idCurve", allowNull: true}
    }
}, {
    source: 'Analysis',
    target: 'DepthAxis',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idCurve", allowNull: true}
    }
}, {
    source: 'Curve',
    target: 'DepthAxis',
    type: 'hasMany',
    options: {
        foreignKey: {name: "idCurve", allowNull: true}
    }
}]

function createRelation(db, relation) {
    db[relation.source][relation.type](db[relation.target], relation.options);
}

function associate(db) {
    for (let relation of relations) {
        createRelation(db, relation);
    }
}

module.exports = associate;