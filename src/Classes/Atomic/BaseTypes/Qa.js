'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Qa extends DatabaseFieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "hold_screen_design", "parent"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent', 'parent'];
	}
}

module.exports = Qa;
