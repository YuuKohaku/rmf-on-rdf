'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class SystemEntity extends DatabaseFieldset {
	static get fields(){
		return  ["login", "password_hash", "permissions", "state", "default_workstation", "available_workstation"];
	}
}

module.exports = SystemEntity;