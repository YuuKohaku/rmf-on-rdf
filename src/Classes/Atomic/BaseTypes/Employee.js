'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Employee extends DatabaseFieldset {
	static get fields(){
		return ["phone", "first_name", "last_name", "middle_name", "login", "password_hash", "provides", "has_schedule", "permissions", "state", "default_workstation", "available_workstation"];
	}

	static get references() {
		return ["provides", "has_schedule", "permissions"];
	}
}

module.exports = Employee;
