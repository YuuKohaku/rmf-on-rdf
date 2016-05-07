'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class JaneDoe extends DatabaseFieldset {
	constructor() {
		let fields = this.constructor.fields;
		super(fields);
	}

	static get fields(){
		return  ["provides", "has_schedule", "permissions", "state"];
	}

	static get references() {
		return ["provides", "has_schedule", "permissions"];
	}
}

module.exports = JaneDoe;
