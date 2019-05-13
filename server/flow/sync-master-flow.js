const masterDb = require('../models-master');
const async = require('async');
const flows = [
	{
		content: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:wi="http://wi.i2g.cloud" id="diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd"><bpmn2:process id="Process_1" isExecutable="true"><bpmn2:serviceTask id="ServiceTask_0fz0iws" name="Shale Volume - Gamma Ray" wi:expression="execute" wi:idTask="10012" icon="clay-volume-16x16"><bpmn2:outgoing>SequenceFlow_0kc2fby</bpmn2:outgoing></bpmn2:serviceTask><bpmn2:serviceTask id="ServiceTask_0gimksa" name="Porosity - Density" wi:expression="execute" wi:idTask="10014" icon="calculate-open-porosity-16x16"><bpmn2:incoming>SequenceFlow_0kc2fby</bpmn2:incoming><bpmn2:outgoing>SequenceFlow_108bvda</bpmn2:outgoing></bpmn2:serviceTask><bpmn2:serviceTask id="ServiceTask_0u7bztc" name="Water Saturation - Archie" wi:expression="execute" wi:idTask="10015" icon="water-saturation-16x16"><bpmn2:incoming>SequenceFlow_108bvda</bpmn2:incoming><bpmn2:outgoing>SequenceFlow_08fokkj</bpmn2:outgoing></bpmn2:serviceTask><bpmn2:serviceTask id="ServiceTask_0jmwtol" name="Clastic - Summaries" wi:expression="execute" wi:idTask="10016" icon="summation-16x16"><bpmn2:incoming>SequenceFlow_08fokkj</bpmn2:incoming></bpmn2:serviceTask><bpmn2:sequenceFlow id="SequenceFlow_0kc2fby" sourceRef="ServiceTask_0fz0iws" targetRef="ServiceTask_0gimksa" /><bpmn2:sequenceFlow id="SequenceFlow_108bvda" sourceRef="ServiceTask_0gimksa" targetRef="ServiceTask_0u7bztc" /><bpmn2:sequenceFlow id="SequenceFlow_08fokkj" sourceRef="ServiceTask_0u7bztc" targetRef="ServiceTask_0jmwtol" /><bpmn2:serviceTask id="ServiceTask_1tlk6oz" name="Shale Volume - Neutron-Density" wi:expression="execute" wi:idTask="10017" wi:disabled="true" icon="clay-volume-16x16" /><bpmn2:serviceTask id="ServiceTask_1pdmkfx" name="Porosity - Neutron" wi:expression="execute" wi:idTask="10018" wi:disabled="true" icon="calculate-open-porosity-16x16" /><bpmn2:serviceTask id="ServiceTask_0cc1uq4" name="Porosity - Sonic" wi:expression="execute" wi:idTask="10019" wi:disabled="true" icon="calculate-open-porosity-16x16" /><bpmn2:serviceTask id="ServiceTask_0m3ht28" name="Water Saturation - Non-poro Sw" wi:expression="execute" wi:idTask="10020" wi:disabled="true" icon="water-saturation-16x16" /></bpmn2:process><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"><bpmndi:BPMNShape id="ServiceTask_0fz0iws_di" bpmnElement="ServiceTask_0fz0iws"><dc:Bounds x="157" y="236" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="ServiceTask_0gimksa_di" bpmnElement="ServiceTask_0gimksa"><dc:Bounds x="331" y="236" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="ServiceTask_0u7bztc_di" bpmnElement="ServiceTask_0u7bztc"><dc:Bounds x="503" y="236" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="ServiceTask_0jmwtol_di" bpmnElement="ServiceTask_0jmwtol"><dc:Bounds x="670" y="236" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNEdge id="SequenceFlow_0kc2fby_di" bpmnElement="SequenceFlow_0kc2fby"><di:waypoint x="257" y="276" /><di:waypoint x="331" y="276" /><bpmndi:BPMNLabel><dc:Bounds x="294" y="254" width="0" height="13" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge><bpmndi:BPMNEdge id="SequenceFlow_108bvda_di" bpmnElement="SequenceFlow_108bvda"><di:waypoint x="431" y="276" /><di:waypoint x="503" y="276" /><bpmndi:BPMNLabel><dc:Bounds x="467" y="254" width="0" height="13" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge><bpmndi:BPMNEdge id="SequenceFlow_08fokkj_di" bpmnElement="SequenceFlow_08fokkj"><di:waypoint x="603" y="276" /><di:waypoint x="670" y="276" /><bpmndi:BPMNLabel><dc:Bounds x="636.5" y="254" width="0" height="13" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge><bpmndi:BPMNShape id="ServiceTask_1tlk6oz_di" bpmnElement="ServiceTask_1tlk6oz"><dc:Bounds x="157" y="366" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="ServiceTask_1pdmkfx_di" bpmnElement="ServiceTask_1pdmkfx"><dc:Bounds x="331" y="366" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="ServiceTask_0cc1uq4_di" bpmnElement="ServiceTask_0cc1uq4"><dc:Bounds x="331" y="494" width="100" height="80" /></bpmndi:BPMNShape><bpmndi:BPMNShape id="ServiceTask_0m3ht28_di" bpmnElement="ServiceTask_0m3ht28"><dc:Bounds x="503" y="366" width="100" height="80" /></bpmndi:BPMNShape></bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn2:definitions>`,
		description: "I2G Flow Template",
		idFlow: 10000,
		name: "Quick Look Analysis",
	}
];
const tasks = [
	{
		content: `{"other":{},"icon":"clay-volume-16x16","function":"calVSHfromGR","inputs":{"_0":{"name":"Gamma Ray","unit":"gAPI","family":"Gamma Ray","type":"2","value":"Gamma Ray"}},"parameters":{"_0":{"name":"GR clean","type":"number","value":10,"unit":"gAPI","color":"red"},"_1":{"name":"GR shale","type":"number","value":120,"unit":"gAPI","color":"green"},"_2":{"name":"Method","type":"select","value":"Linear","choices":["Linear","Clavier","Larionov Tertiary rocks","Larionov older rocks","Stieber variation I","Stieber - Miocene and Pliocene","Stieber variation II"]}},"outputs":[{"name":"VSH_GR","family":"Shale Volume","unit":"v/v","use":true,"idFamily":1019,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calVSHfromGR"}`,
		idFlow: 10000,
		idTask: 10000,
		idTaskSpec: 1,
		name: "Shale Volume - Gamma Ray"
	},
	{
		content: `{"other":{},"icon":"calculate-open-porosity-16x16","function":"calPorosityFromDensity","inputs":{"_0":{"name":"Bulk Density","family":"Bulk Density","unit":"g/cm3","type":"2","value":"Bulk Density"},"_1":{"name":"Shale Volume","family":"Shale Volume","unit":"v/v","type":"2","value":"Shale Volume"}},"parameters":{"_0":{"name":"Density Matrix","type":"number","value":2.65,"unit":"g/cm3","color":"red"},"_1":{"name":"Density Fluid","type":"number","value":1,"unit":"g/cm3"},"_2":{"name":"Density Shale","type":"number","value":2.4,"unit":"d/cm3","color":"green"}},"outputs":[{"name":"PHIT_D","family":"Total Porosity","unit":"v/v","use":true,"idFamily":628,"defaultUnit":"v/v"},{"name":"PHIE_D","family":"Effective Porosity","unit":"v/v","use":true,"idFamily":597,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calPorosityFromDensity"}`,
		idFlow: 10000,
		idTask: 10001,
		idTaskSpec: 11,
		name: "Porosity - Density"
	},
	{
		content: `{"other":{},"icon":"water-saturation-16x16","function":"calSaturationArchie","inputs":{"_0":{"name":"Formation Resistivity","family":"Formation Resistivity","unit":"ohm.m","value":"Formation Resistivity","type":"2"},"_1":{"name":"Porosity","family":"Porosity","unit":"v/v","type":"2","value":"Porosity"},"_2":{"name":"Invaded Resistivity","family":"Invaded Zone Resistivity","unit":"ohm.m","allowNull":true,"value":"Invaded Zone Resistivity","type":"2"}},"parameters":{"_0":{"name":"a","type":"number","value":1,"unit":"unitless"},"_1":{"name":"m","type":"number","value":2,"unit":"unitless"},"_2":{"name":"n","type":"number","value":2,"unit":"unitless"},"_3":{"name":"Rw","type":"number","value":0.03,"unit":"ohm.m"},"_4":{"name":"Rmf","type":"number","value":0.1,"unit":"ohm.m"}},"outputs":[{"name":"Sw_Ar","family":"Water Saturation","unit":"v/v","use":true,"idFamily":885,"defaultUnit":"v/v"},{"name":"Sxo_Ar","family":"Flushed Zone Water Saturation","unit":"v/v","use":true,"idFamily":873,"defaultUnit":"v/v"},{"name":"Bvw_Ar","family":"Bulk Fluid Volume","unit":"v/v","use":true,"idFamily":994,"defaultUnit":"v/v"},{"name":"BvwSxo_Ar","family":"Bulk Fluid Volume","unit":"v/v","use":true,"idFamily":994,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calSaturationArchie"}`,
		idFlow: 10000,
		idTask: 10002,
		idTaskSpec: 18,
		name: "Water Saturation - Archie"
	},
	{
		content: `{"other":{"summation":true,"multiple":true,"addParamFlag":true,"inputTemplate":{"name":"Curve","allowNull":true},"paramTemplate":{"name":"Custom Cutoff 4","type":"handsontable","tableType":"condition","value":[{"method":"Value <= Min","min":0.5}],"nameEditable":true},"outputsMultiple":true,"outputFromParameters":true,"outputTemplate":{"name":"CUSTOM_FL","family":"Net Flag","unit":"UNITLESS","parameters":[],"shading":"red"}},"icon":"summation-16x16","function":"calClasticfSummation","inputs":{"_0":{"name":"Shale Volume","unit":"v/v","family":"Shale Volume","type":"2","value":"Shale Volume"},"_1":{"name":"Porosity","unit":"v/v","family":"Porosity","type":"2","value":"Porosity"},"_2":{"name":"Water Saturation","unit":"v/v","family":"Water Saturation","type":"2","value":"Water Saturation"}},"options":{"_0":{"name":"TVD","family":"True Vertical Depth","unit":"m"},"_1":{"name":"TVDSS","family":"True Vertical Depth Sub Sea","unit":"m"}},"parameters":{"_0":{"id":"Vshale Cutoff","name":"Vshale Cutoff","type":"handsontable","tableType":"condition","value":[{"method":"Min < Value <= Max","min":0,"max":0.4}]},"_1":{"id":"Phi Cutoff","name":"Phi Cutoff","type":"handsontable","tableType":"condition","value":[{"method":"Value < Min or Value >= Max","min":0,"max":0.15}]},"_2":{"id":"SW Cutoff","name":"SW Cutoff","type":"handsontable","tableType":"condition","value":[{"method":"Min < Value <= Max","min":0,"max":0.6}]}},"outputs":[{"name":"ROCK","family":"Net Flag","unit":"UNITLESS","parameters":[{"id":"Vshale Cutoff"}],"shading":"yellow","use":true,"idFamily":328,"defaultUnit":"UNITLESS"},{"name":"RES","family":"Net Flag","unit":"UNITLESS","parameters":[{"id":"Vshale Cutoff"},{"id":"Phi Cutoff"}],"shading":"green","use":true,"idFamily":328,"defaultUnit":"UNITLESS"},{"name":"PAY","family":"Net Flag","unit":"UNITLESS","parameters":[{"id":"Vshale Cutoff"},{"id":"Phi Cutoff"},{"id":"SW Cutoff"}],"shading":"red","use":true,"idFamily":328,"defaultUnit":"UNITLESS"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calClasticfSummation"}`,
		idFlow: 10000,
		idTask: 10003,
		idTaskSpec: 27,
		name: "Clastic - Summaries"
	},
	{
		content: `{"other":{"overlay_line":"Schlumberger Den/Neut Corr. Rhof 1.0","scaleLeft":-0.15,"scaleRight":0.45,"scaleBottom":3,"scaleTop":2},"icon":"clay-volume-16x16","function":"calVSHfromND","inputs":{"_0":{"name":"Neutron Porosity","unit":"v/v","family":"Neutron Porosity","type":"2","value":"Neutron Porosity"},"_1":{"name":"Bulk Density","unit":"g/cm3","family":"Bulk Density","type":"2","value":"Bulk Density"}},"parameters":{"_0":{"name":"NPHI_clean_2","type":"number","value":0.25,"unit":"v/v"},"_1":{"name":"NPHI_shale","type":"number","value":0.4,"unit":"v/v","color":"green"},"_2":{"name":"NPHI_clean_1","type":"number","value":-0.01,"unit":"v/v"},"_3":{"name":"RHOB_clean_2","type":"number","value":2.2,"unit":"g/cm3"},"_4":{"name":"RHOB_shale","type":"number","value":2.4,"unit":"g/cm3","color":"red"},"_5":{"name":"RHOB_clean_1","type":"number","value":2.65,"unit":"g/cm3"}},"outputs":[{"name":"VSH_ND","family":"Shale Volume","unit":"v/v","use":true,"idFamily":1019,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calVSHfromND"}`,
		idFlow: 10000,
		idTask: 10004,
		idTaskSpec: 2,
		name: "Shale Volume - Neutron-Density"
	},
	{
		content: `{"other":{},"icon":"calculate-open-porosity-16x16","function":"calPorosityFromNeutron","inputs":{"_0":{"name":"Neutron","family":"Neutron Porosity","unit":"v/v","type":"2","value":"Neutron Porosity"},"_1":{"name":"Shale Volume","family":"Shale Volume","unit":"v/v","type":"2","value":"Shale Volume"}},"parameters":{"_0":{"name":"Neutron Matrix","type":"number","value":-0.01,"unit":"v/v","color":"red"},"_1":{"name":"Neutron Fluid","type":"number","value":0.991,"unit":"v/v"},"_2":{"name":"Neutron Shale","type":"number","value":0.4,"unit":"v/v","color":"green"}},"outputs":[{"name":"PHIT_N","family":"Total Porosity","unit":"v/v","use":true,"idFamily":628,"defaultUnit":"v/v"},{"name":"PHIE_N","family":"Effective Porosity","unit":"v/v","use":true,"idFamily":597,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calPorosityFromNeutron"}`,
		idFlow: 10000,
		idTask: 10005,
		idTaskSpec: 12,
		name: "Porosity - Neutron"
	},
	{
		content: `{"other":{},"icon":"calculate-open-porosity-16x16","function":"calPorosityFromSonic","inputs":{"_0":{"name":"Compressional Slowness","family":"Compressional Slowness","unit":"us/ft","type":"2","value":"Compressional Slowness"},"_1":{"name":"Shale Volume","family":"Shale Volume","unit":"v/v","type":"2","value":"Shale Volume"}},"parameters":{"_0":{"name":"Sonic Matrix","type":"number","value":55,"unit":"us/ft","color":"#F0F"},"_1":{"name":"Sonic Fluid","type":"number","value":189,"unit":"us/ft"},"_2":{"name":"Sonic Shale","type":"number","value":110,"unit":"us/ft","color":"green"},"_3":{"name":"Sonic Method","type":"select","value":"Wyliie","choices":["Wyliie","Raymer-Hunt-Gardner"]},"_4":{"name":"Cp","type":"number","value":1}},"outputs":[{"name":"PHIT_S","family":"Total Porosity","unit":"v/v","use":true,"idFamily":628,"defaultUnit":"v/v"},{"name":"PHIE_S","family":"Effective Porosity","unit":"v/v","use":true,"idFamily":597,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calPorosityFromSonic"}`,
		idFlow: 10000,
		idTask: 10006,
		idTaskSpec: 13,
		name: "Porosity - Sonic"
	},
	{
		content: `{"other":{},"icon":"water-saturation-16x16","function":"calSaturationNonPoro","inputs":{"_0":{"name":"Micro Resistivity","family":"Micro Resistivity","unit":"ohm.m","type":"2","value":"Micro Resistivity"},"_1":{"name":"Resistivity","family":"Resistivity","unit":"ohm.m","type":"2","value":"Resistivity"}},"parameters":{"_0":{"name":"Rw","type":"number","value":0.03},"_1":{"name":"Rmf","type":"number","value":0.1}},"outputs":[{"name":"Sw_QL","family":"Water Saturation","unit":"v/v","use":true,"idFamily":885,"defaultUnit":"v/v"}],"inputData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calSaturationNonPoro"}`,
		idFlow: 10000,
		idTask: 10007,
		idTaskSpec: 67,
		name: "Water Saturation - Non-poro Sw"
	}
];

function syncMasterFlow(cb) {
	async.each(flows, function (flow, next) {
		masterDb.Flow.create(flow).then(() => {
			next();
		}).catch(err => {
			console.log("New flow err");
			next();
		})
	}, function () {
		console.log("Done all flow");
		cb();
	});
}

function syncMasterTask(cb) {
	async.each(tasks, function (task, next) {
		masterDb.Task.create(task).then(() => {
			next();
		}).catch(err => {
			console.log("New task err");
			next();
		});
	}, function () {
		console.log("Done all task");
		cb();
	});
}

module.exports = {
	syncMasterFlow,
	syncMasterTask
};