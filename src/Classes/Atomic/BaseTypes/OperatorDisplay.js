'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class OperatorDisplay extends DatabaseFieldset {
	static get fields() {
		return ["default_agent", 'attached_to', "device_type", "hold_screen_design", "parent", "backdrop_design"];
	}

	static get references() {
		return ['attached_to', 'default_agent', 'parent'];
	}
}

module.exports = OperatorDisplay;