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

async function getWellTopDepth(idWell, dbConnection) {
    let topDepth;
    try {
        let well = await dbConnection.Well.findById(idWell, {include: dbConnection.Dataset});
        if (well.datasets.length === 0) {
            return null;
        } else {
            topDepth = 999999999;
            well.datasets.forEach(dataset => {
                topDepth = dataset.top < topDepth ? dataset.top : topDepth;
            });
            return topDepth;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getWellBottomDepth(idWell, dbConnection) {
    let bottomDepth;
    try {
        let well = await dbConnection.Well.findById(idWell, {include: dbConnection.Dataset});
        if (well.datasets.length === 0) {
            return null;
        } else {
            bottomDepth = -999999999;
            well.datasets.forEach(dataset => {
                bottomDepth = dataset.bottom > bottomDepth ? dataset.top : bottomDepth;
            });
            return bottomDepth;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getWellByDataset(idDataset, dbConnection) {
    try {
        let dataset = idDataset ? await dbConnection.Dataset.findById(idDataset) : null;
        if (dataset) {
            return await dbConnection.Well.findById(dataset.idWell);
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

module.exports = {
    renameObjectForDustbin: renameObjectForDustbin,
    getWellBottomDepth,
    getWellTopDepth,
    getWellByDataset
};