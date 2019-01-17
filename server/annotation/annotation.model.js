"use strict";
let ResponseJSON = require('../response');
let ErrorCodes = require('../../error-codes').CODES;

function createNewAnnotation(annotationInfo, done, dbConnection) {
    let Annotation = dbConnection.Annotation;
    Annotation.create(annotationInfo).then(result => {
        done(ResponseJSON(ErrorCodes.SUCCESS, "Create new Annotation success", result));
    }).catch(err => {
        console.log(err);
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Create new Annotation error", err.message));
    });
}

function getAnnotationInfo(annotationID, done, dbConnection) {
    let Annotation = dbConnection.Annotation;
    Annotation.findByPk(annotationID.idAnnotation, {
        include: [{all: true}]
    }).then(rs => {
        if (rs) {
            done(ResponseJSON(ErrorCodes.SUCCESS, "Successful", rs));
        } else {
            done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "No annotaion found by id"));
        }
    }).catch(err => {
        done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Failed", err.message));
    })
}

function editAnnotation(annotationInfo, done, dbConnection) {
    delete annotationInfo.createdBy;
    let Annotation = dbConnection.Annotation;
    Annotation.findByPk(annotationInfo.idAnnotation)
        .then(function (annotation) {
            Object.assign(annotation, annotationInfo)
                .save()
                .then(function (result) {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Edit Annotation success", result));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_INVALID_PARAMS, "Edit Annotation" + err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Annotation not found for edit"));
        })
}

function deleteAnnotation(annotationInfo, done, dbConnection) {
    let Annotation = dbConnection.Annotation;
    Annotation.findByPk(annotationInfo.idAnnotation)
        .then(function (annotation) {
            annotation.setDataValue('updatedBy', annotationInfo.updatedBy);
            annotation.destroy()
                .then(function () {
                    done(ResponseJSON(ErrorCodes.SUCCESS, "Annotation is deleted", annotation));
                })
                .catch(function (err) {
                    done(ResponseJSON(ErrorCodes.ERROR_DELETE_DENIED, "Delete Annotation " + err.message, err.message));
                })
        })
        .catch(function () {
            done(ResponseJSON(ErrorCodes.ERROR_ENTITY_NOT_EXISTS, "Annotation not found for delete"))
        })
}

module.exports = {
    createNewAnnotation: createNewAnnotation,
    getAnnotationInfo: getAnnotationInfo,
    editAnnotation: editAnnotation,
    deleteAnnotation: deleteAnnotation
}

