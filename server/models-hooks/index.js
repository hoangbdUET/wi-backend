module.exports = function (dbConnection) {
    let models = [
        'Annotation',
        'Curve',
        'Dataset',
        'DepthAxis',
        'Flow',
        'GenericObjectTrack',
        'Image',
        'ImageSet',
        'ImageTrack',
        'Line',
        'Marker',
        'MarkerSet',
        'MarkerSetTemplate',
        'MarkerTemplate',
        'ObjectOfTrack',
        'ObjectTrack',
        'ParameterSet',
        'Plot',
        'Project',
        'ReferenceCurve',
        'Shading',
        'TadpoleTrack',
        'Task',
        'Track',
        'Well',
        'Zone',
        'ZoneSet',
        'ZoneSetTemplate',
        'ZoneTemplate',
        'ZoneTrack'
    ];
    // let models = [];
    models.forEach(function (model) {
        require(__dirname + '/' + model)(dbConnection);
    });
};