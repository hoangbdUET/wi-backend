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
        'ObjectOfTrack',
        'ObjectTrack',
        'ParameterSet',
        'Plot',
        'Project',
        'ReferenceCurve',
        'Shading',
        'TadpoleTrack',
        'Track',
        'Well',
        'Zone',
        'ZoneSet',
        'ZoneSetTemplate',
        'ZoneTrack'
    ];
    // let models = [];
    models.forEach(function (model) {
        require(__dirname + '/' + model)(dbConnection);
    });
};