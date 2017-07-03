var input="projectTab";
var regex=/[a-z][A-Z]/;
var result=input.replace(regex,function(x){
	console.log(x);
	return "-"+x;
});
console.log(result);
