let overlayLineUpdate = require('./server/overlay-line/overlay-line.update');
let workflowSpecUpdate = require('./server/workflow-spec/workflow-spec.update');
let taskSpecUpdate = require('./server/task/task-spec').createTaskSpec;
let zoneTemplateUpdate = require('./server/zone-template/zone-template.model').createZoneTemplateFromXLSX;
let markerTemplateUpdate = require('./server/marker-template/marker-template.function').importMarkerTemplate;
let familySystemSync = require('./server/family/FamilySystemSync');
familySystemSync(function () {
    overlayLineUpdate(function () {
        workflowSpecUpdate(function () {
            taskSpecUpdate(function () {
                zoneTemplateUpdate(function () {
                    markerTemplateUpdate(function () {
                        console.log("Sync successfull");
                        process.exit();
                    });
                });
            });
        });
    });
});