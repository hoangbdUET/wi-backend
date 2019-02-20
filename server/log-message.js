'use strict';

class Message {
	constructor(object, idObject, content) {
		this.object = object;
		this.idObject = idObject;
		this.content = content;
	}
}

module.exports = function response(object, idObject, content) {
	object = object || "undefine";
	idObject = idObject || "";
	content = content || "No message";
	return new Message(object, idObject, content);
};
