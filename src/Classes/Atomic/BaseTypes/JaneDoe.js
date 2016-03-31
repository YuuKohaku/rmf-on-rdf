'use strict'

let Fieldset = require("./Fieldset");

class JaneDoe extends Fieldset {
	constructor() {
		let fields = ["provides", "has_schedule", "permissions", "state"];
		super(fields);
	}

	get references() {
		return ["provides", "has_schedule", "permissions"];
	}
}

module.exports = JaneDoe;
