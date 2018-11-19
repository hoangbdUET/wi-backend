let globalWorkflowSpecModel = require('../models-master').WorkflowSpec;
let async = require('async');

let wfs = [
    {
        "name": "Clastic",
        "type": 0,
        "description": "",
        "content": {
            "name": "Clastic",
            "steps": [
                {
                    "name": "Clay Volume",
                    "inputs": [
                        {
                            "name": "Gamma Ray"
                        }
                    ],
                    "parameters": [
                        {
                            "name": "GR clean",
                            "type": "number",
                            "value": 10
                        },
                        {
                            "name": "GR clay",
                            "type": "number",
                            "value": 120
                        },
                        {
                            "name": "Method",
                            "type": "select",
                            "value": 1,
                            "choices": [
                                {
                                    "name": "Linear",
                                    "value": 1
                                },
                                {
                                    "name": "Clavier",
                                    "value": 2
                                },
                                {
                                    "name": "Larionov Tertiary rocks",
                                    "value": 3
                                },
                                {
                                    "name": "Larionov older rocks",
                                    "value": 4
                                },
                                {
                                    "name": "Stieber variation I",
                                    "value": 5
                                },
                                {
                                    "name": "Stieber - Miocene and Pliocene",
                                    "value": 6
                                },
                                {
                                    "name": "Stieber variation II",
                                    "value": 7
                                }
                            ]
                        }
                    ],
                    "outputs": [
                        {
                            "name": "VCL_GR",
                            "family": "Clay Volume"
                        }
                    ],
                    "function": "calVCLfromGR"
                },
                {
                    "name": "Porosity",
                    "inputs": [
                        {
                            "name": "Bulk Density"
                        },
                        {
                            "name": "Clay Volume"
                        }
                    ],
                    "parameters": [
                        {
                            "name": "clean",
                            "type": "number",
                            "value": 2.65
                        },
                        {
                            "name": "fluid",
                            "type": "number",
                            "value": 1
                        },
                        {
                            "name": "clay",
                            "type": "number",
                            "value": 2.3
                        }
                    ],
                    "outputs": [
                        {
                            "name": "PHIT_D",
                            "family": "Total Porosity"
                        },
                        {
                            "name": "PHIE_D",
                            "family": "Effective Porosity"
                        }
                    ],
                    "function": "calPorosityFromDensity"
                },
                {
                    "name": "Saturation",
                    "inputs": [
                        {
                            "name": "Formation Resistivity"
                        },
                        {
                            "name": "Porosity"
                        }
                    ],
                    "parameters": [
                        {
                            "name": "a",
                            "type": "number",
                            "value": 1
                        },
                        {
                            "name": "m",
                            "type": "number",
                            "value": 2
                        },
                        {
                            "name": "n",
                            "type": "number",
                            "value": 2
                        },
                        {
                            "name": "Rw",
                            "type": "number",
                            "value": 0.03
                        }
                    ],
                    "outputs": [
                        {
                            "name": "SW_AR",
                            "family": "Water Saturation"
                        },
                        {
                            "name": "SH_AR",
                            "family": "Hydrocarbon Saturation"
                        },
                        {
                            "name": "SW_AR_UNCL",
                            "family": "Water Saturation Unclipped"
                        },
                        {
                            "name": "BVW_AR",
                            "family": "Bulk Volume Water"
                        }
                    ],
                    "function": "calSaturationArchie"
                },
                {
                    "name": "Summation",
                    "inputs": [
                        {
                            "name": "Clay Volume"
                        },
                        {
                            "name": "Porosity"
                        },
                        {
                            "name": "Water Saturation"
                        }
                    ],
                    "parameters": [
                        {
                            "name": "Min Res Height",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "Min Pay Height",
                            "type": "number",
                            "value": 0
                        },
                        {
                            "name": "Vclay Cut",
                            "type": "number",
                            "value": 0.35
                        },
                        {
                            "name": "Phi Cut",
                            "type": "number",
                            "value": 0.15
                        },
                        {
                            "name": "Sw Cut",
                            "type": "number",
                            "value": 0.6
                        }
                    ],
                    "outputs": [
                        {
                            "name": "NetRes",
                            "family": "Net Reservoir Flag"
                        },
                        {
                            "name": "NetPay",
                            "family": "Net Pay Flag"
                        }
                    ],
                    "function": "calCutoffSummation"
                }
            ]
        },
        "idWorkflowSpec": 1
    },
    {
        "name": "Regression",
        "type": 1,
        "description": "[ML] Regression",
        "content": {
            "name": "CURVE_PREDICTION",
            "model": {
                "type": "curve",
                "inputs": [
                    {
                        "class": "Input Curve"
                    },
                    {
                        "class": "Input Curve"
                    },
                    {
                        "class": "Target Output"
                    }
                ]
            },
            "steps": [
                {
                    "name": "Train"
                },
                {
                    "name": "Verify"
                },
                {
                    "name": "Predict"
                }
            ]
        },
        "idWorkflowSpec": 2
    },
    {
        "name": "Classification",
        "type": 1,
        "description": "[ML] Classification",
        "content": {
            "name": "CURVE_PREDICTION_CLASSIFIICATION",
            "model": {
                "type": "classification",
                "inputs": [
                    {
                        "class": "Input Curve"
                    },
                    {
                        "class": "Input Curve"
                    },
                    {
                        "class": "Target Output"
                    }
                ]
            },
            "steps": [
                {
                    "name": "Train"
                },
                {
                    "name": "Verify"
                },
                {
                    "name": "Predict"
                }
            ]
        },
        "idWorkflowSpec": 3
    },
    {
        "name": "Permeability AI",
        "type": 1,
        "description": "[ML] Perm Dual Model",
        "content": {
            "name": "PERM_DUAL_MODEL",
            "model": {
                "type": "anfis",
                "inputs": [
                    {
                        "class": "GR"
                    },
                    {
                        "class": "NPHI"
                    },
                    {
                        "class": "RHOB"
                    },
                    {
                        "class": "DT"
                    },
                    {
                        "class": "VCL"
                    },
                    {
                        "class": "PHIE"
                    },
                    {
                        "class": "PERM_CORE"
                    }
                ]
            },
            "steps": [
                {
                    "name": "Verify"
                },
                {
                    "name": "Predict"
                }
            ]
        },
        "idWorkflowSpec": 4
    },
    {
        "name": "Cross Recurrence Plot",
        "type": 1,
        "description": "[ML] Cross Recurrence Plot",
        "content": {
            "name": "CROSS_RECURRENCE_PLOT",
            "model": {
                "type": "crp",
                "inputs": [
                    {
                        "class": "Input Curve"
                    },
                    {
                        "class": "Input Curve"
                    },
                    {
                        "class": "Target Output"
                    }
                ]
            },
            "steps": [
                {
                    "name": "Train"
                },
                {
                    "name": "Verify"
                },
                {
                    "name": "Predict"
                }
            ]
        },
        "idWorkflowSpec": 5
    },
    {
        "name": "Himpe",
        "type": 1,
        "description": "[ML] Himepe Model",
        "content": {
            "name": "HIMPE_MODEL",
            "model": {
                "type": "himpe",
                "inputs": [
                    {
                        "class": "GR"
                    },
                    {
                        "class": "NPHI"
                    },
                    {
                        "class": "RHOB"
                    },
                    {
                        "class": "DT"
                    },
                    {
                        "class": "VCL"
                    },
                    {
                        "class": "PHIE"
                    },
                    {
                        "class": "PERM_CORE"
                    }
                ]
            },
            "steps": [
                {
                    "name": "Verify"
                },
                {
                    "name": "Predict"
                }
            ]
        },
        "idWorkflowSpec": 6
    }
];
module.exports = function (callback) {
    async.each(wfs, function (wf, next) {
        globalWorkflowSpecModel.create(wf).then(() => {
            next();
        }).catch(() => {
            next();
        });
    }, function () {
        console.log("Done Workflow Spec");
        callback();
    });
};