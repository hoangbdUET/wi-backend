function renameObjectForDustbin(object, callback, type) {
    //type = delete / restore
    object.name = type === 'delete' ? '$' + object.name : object.name;
    object.save().then((rs) => {
        if (callback) callback(null, rs.toJSON());
    }).catch(err => {
        if (err.name === "SequelizeUniqueConstraintError") {
            let existNumber;
            object.name = type === 'delete' ? object.name.substring(1) : object.name;
            if (object.name.lastIndexOf('__') !== -1) {
                existNumber = parseInt(object.name.substring(object.name.lastIndexOf('__') + 2, object.name.length));
                existNumber++;
                object.name = object.name.substring(0, object.name.lastIndexOf('__')) + '__' + existNumber;
                renameObjectForDustbin(object, callback, type);
            } else {
                object.name = object.name + '__1';
                renameObjectForDustbin(object, callback, type);
            }
        } else {
            console.log(err);
            if (callback) callback(err, null);
        }
    });

}

module.exports = {
    renameObjectForDustbin: renameObjectForDustbin
};