'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Administrator extends DatabaseFieldset {
	static get fields() {
		return ["occupied_by", "default_agent", "attached_to", "device_type"];
	}

	static get references() {
		return ['occupied_by', 'attached_to', 'default_agent', 'allows_role'];
	}
}

module.exports = Administrator;
