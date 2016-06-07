'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class JaneDoe extends DatabaseFieldset {
	static get fields(){
		return  ["provides", "has_schedule", "permissions", "state"];
	}

	static get references() {
		return ["provides", "has_schedule", "permissions"];
	}
}

module.exports = JaneDoe;
