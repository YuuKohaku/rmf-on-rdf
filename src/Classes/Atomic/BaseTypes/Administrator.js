'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Administrator extends DatabaseFieldset {
	constructor() {
		let fields = ["occupied_by", "default_agent", "attached_to", "device_type"];
		super(fields);
	}
	get references() {
		return ['occupied_by', 'attached_to', 'default_agent', 'allows_role'];
	}
}

module.exports = Administrator;
