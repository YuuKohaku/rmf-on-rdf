'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class SystemEntity extends DatabaseFieldset {
	constructor() {
		let fields = ["login", "password_hash", "permissions", "state", "default_workstation", "available_workstation"];
		super(fields);
	}
}

module.exports = SystemEntity;