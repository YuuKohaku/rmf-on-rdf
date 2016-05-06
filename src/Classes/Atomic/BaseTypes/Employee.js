'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Employee extends DatabaseFieldset {
	constructor() {
		let fields = ["phone", "first_name", "last_name", "middle_name", "login", "password_hash", "provides", "has_schedule", "permissions", "state", "default_workstation", "available_workstation"];
		super(fields);
	}

	get references() {
		return ["provides", "has_schedule", "permissions"];
	}
}

module.exports = Employee;
