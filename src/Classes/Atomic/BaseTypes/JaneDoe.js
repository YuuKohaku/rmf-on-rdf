'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class JaneDoe extends DatabaseFieldset {
	constructor() {
		let fields = ["provides", "has_schedule", "permissions", "state"];
		super(fields);
	}

	get references() {
		return ["provides", "has_schedule", "permissions"];
	}
}

module.exports = JaneDoe;
