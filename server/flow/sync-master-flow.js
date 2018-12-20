const masterDb = require('../models-master');
const async = require('async');
const flows = [
	{
		content: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:wi="http://wi.i2g.cloud" id="diagram" targetNamespace="http://bpmn.io/schema/bpmn" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:serviceTask id="ServiceTask_15kkqdy" name="Shale Volume - Gamma Ray" wi:expression="execute" wi:idTask="10032">
      <bpmn2:outgoing>SequenceFlow_0pfl7zx</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="ServiceTask_1jgh6oq" name="Porosity - Density" wi:expression="execute" wi:idTask="10034">
      <bpmn2:incoming>SequenceFlow_0pfl7zx</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_0bvrmro</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="ServiceTask_0mchu7t" name="Water Saturation - Archie" wi:expression="execute" wi:idTask="10035">
      <bpmn2:incoming>SequenceFlow_0bvrmro</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_07j0gv7</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="ServiceTask_05cx4yn" name="Clastic - Summaries" wi:expression="execute" wi:idTask="10036">
      <bpmn2:incoming>SequenceFlow_07j0gv7</bpmn2:incoming>
    </bpmn2:serviceTask>
    <bpmn2:sequenceFlow id="SequenceFlow_0pfl7zx" sourceRef="ServiceTask_15kkqdy" targetRef="ServiceTask_1jgh6oq" />
    <bpmn2:sequenceFlow id="SequenceFlow_0bvrmro" sourceRef="ServiceTask_1jgh6oq" targetRef="ServiceTask_0mchu7t" />
    <bpmn2:sequenceFlow id="SequenceFlow_07j0gv7" sourceRef="ServiceTask_0mchu7t" targetRef="ServiceTask_05cx4yn" />
    <bpmn2:serviceTask id="ServiceTask_10b67pf" name="Shale Volume - Neutron-Density" wi:expression="execute" wi:idTask="10040" wi:disabled="true" />
    <bpmn2:serviceTask id="ServiceTask_0dg741i" name="Porosity - Neutron" wi:expression="execute" wi:idTask="10041" wi:disabled="true" />
    <bpmn2:serviceTask id="ServiceTask_00y1u9j" name="Porosity - Sonic" wi:expression="execute" wi:idTask="10042" wi:disabled="true" />
    <bpmn2:serviceTask id="ServiceTask_1v83e12" name="Water Saturation - Non-poro Sw" wi:expression="execute" wi:idTask="10043" wi:disabled="true" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="ServiceTask_15kkqdy_di" bpmnElement="ServiceTask_15kkqdy">
        <dc:Bounds x="98" y="148" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_1jgh6oq_di" bpmnElement="ServiceTask_1jgh6oq">
        <dc:Bounds x="243" y="148" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_0mchu7t_di" bpmnElement="ServiceTask_0mchu7t">
        <dc:Bounds x="384" y="148" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_05cx4yn_di" bpmnElement="ServiceTask_05cx4yn">
        <dc:Bounds x="530" y="148" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0pfl7zx_di" bpmnElement="SequenceFlow_0pfl7zx">
        <di:waypoint x="198" y="188" />
        <di:waypoint x="243" y="188" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="220.5" y="167" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_0bvrmro_di" bpmnElement="SequenceFlow_0bvrmro">
        <di:waypoint x="343" y="188" />
        <di:waypoint x="384" y="188" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="363.5" y="167" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_07j0gv7_di" bpmnElement="SequenceFlow_07j0gv7">
        <di:waypoint x="484" y="188" />
        <di:waypoint x="530" y="188" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="507" y="167" width="0" height="12" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="ServiceTask_10b67pf_di" bpmnElement="ServiceTask_10b67pf">
        <dc:Bounds x="98" y="275" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_0dg741i_di" bpmnElement="ServiceTask_0dg741i">
        <dc:Bounds x="243" y="275" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_00y1u9j_di" bpmnElement="ServiceTask_00y1u9j">
        <dc:Bounds x="243" y="392" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_1v83e12_di" bpmnElement="ServiceTask_1v83e12">
        <dc:Bounds x="384" y="275" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`,
		description: null,
		idFlow: 10000,
		name: "Quick Look Analysis",
	}
];
const tasks = [
	{
		content: `{"icon":"clay-volume-16x16","function":"calVSHfromGR","inputs":[{"name":"Gamma Ray","unit":"gAPI","family":"Gamma Ray","type":"2","value":"Gamma Ray"}],"parameters":[{"name":"GR clean","type":"number","value":10,"unit":"gAPI","color":"red"},{"name":"GR shale","type":"number","value":120,"unit":"gAPI","color":"green"},{"name":"Method","type":"select","value":"Linear","choices":["Linear","Clavier","Larionov Tertiary rocks","Larionov older rocks","Stieber variation I","Stieber - Miocene and Pliocene","Stieber variation II"]}],"outputs":[{"name":"VSH_GR","family":"Shale Volume","unit":"v/v","use":true,"idFamily":1019,"defaultUnit":"v/v"}],"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calVSHfromGR"}`,
		idFlow: 10000,
		idTask: 10000,
		idTaskSpec: 1,
		name: "Shale Volume - Gamma Ray"
	},
	{
		content: `{"icon":"calculate-open-porosity-16x16","function":"calPorosityFromDensity","inputs":[{"name":"Bulk Density","family":"Bulk Density","unit":"g/cm3","type":"2","value":"Bulk Density"},{"name":"Shale Volume","family":"Shale Volume","unit":"v/v","type":"2","value":"Shale Volume"}],"parameters":[{"name":"Density Matrix","type":"number","value":2.65,"unit":"g/cm3","color":"red"},{"name":"Density Fluid","type":"number","value":1,"unit":"g/cm3"},{"name":"Density Shale","type":"number","value":2.4,"unit":"d/cm3","color":"green"}],"outputs":[{"name":"PHIT_D","family":"Total Porosity","unit":"v/v","use":true,"idFamily":628,"defaultUnit":"v/v"},{"name":"PHIE_D","family":"Effective Porosity","unit":"v/v","use":true,"idFamily":597,"defaultUnit":"v/v"}],"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calPorosityFromDensity"}`,
		idFlow: 10000,
		idTask: 10001,
		idTaskSpec: 11,
		name: "Porosity - Density"
	},
	{
		content: `{"icon":"water-saturation-16x16","function":"calSaturationArchie","inputs":[{"name":"Formation Resistivity","family":"Formation Resistivity","unit":"ohm.m","type":"2","value":"Formation Resistivity"},{"name":"Porosity","family":"Porosity","unit":"v/v","type":"2","value":"Porosity"},{"name":"Invaded Resistivity","family":"Invaded Zone Resistivity","unit":"ohm.m","allowNull":true}],"parameters":[{"name":"a","type":"number","value":1,"unit":"unitless"},{"name":"m","type":"number","value":2,"unit":"unitless"},{"name":"n","type":"number","value":2,"unit":"unitless"},{"name":"Rw","type":"number","value":0.03,"unit":"ohm.m"},{"name":"Rmf","type":"number","value":0.1,"unit":"ohm.m"}],"outputs":[{"name":"Sw_Ar","family":"Water Saturation","unit":"v/v","use":true,"idFamily":885,"defaultUnit":"v/v"},{"name":"Sxo_Ar","family":"Flushed Zone Water Saturation","unit":"v/v","use":true,"idFamily":873,"defaultUnit":"v/v"},{"name":"Bvw_Ar","family":"Bulk Fluid Volume","unit":"v/v","use":true,"idFamily":994,"defaultUnit":"v/v"},{"name":"BvwSxo_Ar","family":"Bulk Fluid Volume","unit":"v/v","use":true,"idFamily":994,"defaultUnit":"v/v"}],"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calSaturationArchie"}`,
		idFlow: 10000,
		idTask: 10002,
		idTaskSpec: 18,
		name: "Water Saturation - Archie"
	},
	{
		content: `{"icon":"summation-16x16","function":"calClasticfSummation","summation":true,"multiple":true,"addParamFlag":true,"inputs":[{"name":"Shale Volume","unit":"v/v","family":"Shale Volume","type":"2","value":"Shale Volume"},{"name":"Porosity","unit":"v/v","family":"Porosity","type":"2","value":"Porosity"},{"name":"Water Saturation","unit":"v/v","family":"Water Saturation","type":"2","value":"Water Saturation"}],"options":[{"name":"TVD"},{"name":"TVDSS"}],"inputTemplate":{"name":"Curve","allowNull":true},"parameters":[{"id":"Vshale Cutoff","name":"Vshale Cutoff","type":"handsontable","tableType":"condition","value":[{"method":"Min < Value <= Max","min":0,"max":0.4}]},{"id":"Phi Cutoff","name":"Phi Cutoff","type":"handsontable","tableType":"condition","value":[{"method":"Value < Min or Value >= Max","min":0,"max":0.15}]},{"id":"SW Cutoff","name":"SW Cutoff","type":"handsontable","tableType":"condition","value":[{"method":"Min < Value <= Max","min":0,"max":0.6}]}],"paramTemplate":{"name":"Custom Cutoff 4","type":"handsontable","tableType":"condition","value":[{"method":"Value <= Min","min":0.5}],"nameEditable":true},"outputsMultiple":true,"outputFromParameters":true,"outputs":[{"name":"ROCK","family":"Net Flag","unit":"UNITLESS","parameters":[{"id":"Vshale Cutoff"}],"shading":"yellow","use":true,"idFamily":328,"defaultUnit":"UNITLESS"},{"name":"RES","family":"Net Flag","unit":"UNITLESS","parameters":[{"id":"Vshale Cutoff"},{"id":"Phi Cutoff"}],"shading":"green","use":true,"idFamily":328,"defaultUnit":"UNITLESS"},{"name":"PAY","family":"Net Flag","unit":"UNITLESS","parameters":[{"id":"Vshale Cutoff"},{"id":"Phi Cutoff"},{"id":"SW Cutoff"}],"shading":"red","use":true,"idFamily":328,"defaultUnit":"UNITLESS"}],"outputTemplate":{"name":"CUSTOM_FL","family":"Net Flag","unit":"UNITLESS","parameters":[],"shading":"red"},"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calClasticfSummation"}`,
		idFlow: 10000,
		idTask: 10003,
		idTaskSpec: 27,
		name: "Clastic - Summaries"
	},
	{
		content: `{"icon":"clay-volume-16x16","function":"calVSHfromND","overlay_line":"Schlumberger Den/Neut Corr. Rhof 1.0","inputs":[{"name":"Neutron Porosity","unit":"v/v","family":"Neutron Porosity","type":"2","value":"Neutron Porosity"},{"name":"Bulk Density","unit":"g/cm3","family":"Bulk Density","type":"2","value":"Bulk Density"}],"parameters":[{"name":"NPHI_clean_2","type":"number","value":0.25,"unit":"v/v"},{"name":"NPHI_shale","type":"number","value":0.4,"unit":"v/v","color":"green"},{"name":"NPHI_clean_1","type":"number","value":-0.01,"unit":"v/v"},{"name":"RHOB_clean_2","type":"number","value":2.2,"unit":"g/cm3"},{"name":"RHOB_shale","type":"number","value":2.4,"unit":"g/cm3","color":"red"},{"name":"RHOB_clean_1","type":"number","value":2.65,"unit":"g/cm3"}],"outputs":[{"name":"VSH_ND","family":"Shale Volume","unit":"v/v","use":true,"idFamily":1019,"defaultUnit":"v/v"}],"scaleLeft":-0.15,"scaleRight":0.45,"scaleBottom":3,"scaleTop":2,"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calVSHfromND"}`,
		idFlow: 10000,
		idTask: 10004,
		idTaskSpec: 2,
		name: "Shale Volume - Neutron-Density"
	},
	{
		content: `{"icon":"calculate-open-porosity-16x16","function":"calPorosityFromNeutron","inputs":[{"name":"Neutron","family":"Neutron Porosity","unit":"v/v","type":"2","value":"Neutron Porosity"},{"name":"Shale Volume","family":"Shale Volume","unit":"v/v","type":"2","value":"Shale Volume"}],"parameters":[{"name":"Neutron Matrix","type":"number","value":-0.01,"unit":"v/v","color":"red"},{"name":"Neutron Fluid","type":"number","value":0.991,"unit":"v/v"},{"name":"Neutron Shale","type":"number","value":0.4,"unit":"v/v","color":"green"}],"outputs":[{"name":"PHIT_N","family":"Total Porosity","unit":"v/v","use":true,"idFamily":628,"defaultUnit":"v/v"},{"name":"PHIE_N","family":"Effective Porosity","unit":"v/v","use":true,"idFamily":597,"defaultUnit":"v/v"}],"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calPorosityFromNeutron"}`,
		idFlow: 10000,
		idTask: 10005,
		idTaskSpec: 12,
		name: "Porosity - Neutron"
	},
	{
		content: `{"icon":"calculate-open-porosity-16x16","function":"calPorosityFromSonic","inputs":[{"name":"Compressional Slowness","family":"Compressional Slowness","unit":"us/ft","type":"2","value":"Compressional Slowness"},{"name":"Shale Volume","family":"Shale Volume","unit":"v/v","type":"2","value":"Shale Volume"}],"parameters":[{"name":"Sonic Matrix","type":"number","value":55,"unit":"us/ft","color":"#F0F"},{"name":"Sonic Fluid","type":"number","value":189,"unit":"us/ft"},{"name":"Sonic Shale","type":"number","value":110,"unit":"us/ft","color":"green"},{"name":"Sonic Method","type":"select","value":"Wyliie","choices":["Wyliie","Raymer-Hunt-Gardner"]},{"name":"Cp","type":"number","value":1}],"outputs":[{"name":"PHIT_S","family":"Total Porosity","unit":"v/v","use":true,"idFamily":628,"defaultUnit":"v/v"},{"name":"PHIE_S","family":"Effective Porosity","unit":"v/v","use":true,"idFamily":597,"defaultUnit":"v/v"}],"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calPorosityFromSonic"}`,
		idFlow: 10000,
		idTask: 10006,
		idTaskSpec: 13,
		name: "Porosity - Sonic"
	},
	{
		content: `{"icon":"water-saturation-16x16","function":"calSaturationNonPoro","inputs":[{"name":"Micro Resistivity","family":"Micro Resistivity","unit":"ohm.m"},{"name":"Resistivity","family":"Resistivity","unit":"ohm.m"}],"parameters":[{"name":"Rw","type":"number","value":0.03},{"name":"Rmf","type":"number","value":0.1}],"outputs":[{"name":"Sw_QL","family":"Water Saturation","unit":"v/v","use":true,"idFamily":885,"defaultUnit":"v/v"}],"inputData":[],"paramData":[],"zonation":{"name":"Zonation_all","children":["All"]},"save_option":"2","expression":"calSaturationNonPoro"}`,
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
			console.log(err);
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
			console.log(err);
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