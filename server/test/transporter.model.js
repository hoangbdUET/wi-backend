class Transporter {
    constructor() {
        this.transTable = {};
    }

    transData(objData) {
        let arr = Object.keys(objData);
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            if (arr[i].indexOf('id') == 0) {
                objData[arr[i]] = this.getTransNumber(arr[i], objData[arr[i]]);
            } else if (arr[i] == 'referenceCurve') {
                objData[arr[i]] = this.getTransNumber(arr[i], objData[arr[i]]);
            }
        }
        return objData;
    }


    getTransNumber(type, oldId) {
        if (oldId == null) return null;
        if (type == 'idWorkflowSpec' || type == 'idTaskSpec') {
            return oldId;
        }
        if (type == 'idFamily') {
            return null;
        }
        if (this.transTable[type]) {
            let n = this.transTable[type].length;
            for (let i = 0; i < n; i++) {
                if (oldId == this.transTable[type][i].oldValue)
                    return this.transTable[type][i].newValue
            }
        }
        return null;
    }

    updateTransTable(type, oldId, newId) {
        if (this.transTable[type]) {
            this.transTable[type].push({
                oldValue: oldId,
                newValue: newId
            });
        } else {
            this.transTable[type] = [];
            this.transTable[type].push({
                oldValue: oldId,
                newValue: newId
            });
        }
    }
}

module.exports = Transporter;
