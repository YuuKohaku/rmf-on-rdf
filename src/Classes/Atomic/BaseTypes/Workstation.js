'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Workstation extends DatabaseFieldset {
	static get fields() {
		return ["attached_terminal", "occupied_by", "filtering_method", "provides", "has_schedule", "default_agent", "attached_to",
				 "device_sound", "device_design", "device_type", "digital_display_address",
				 "device_placement", "state"];
	}

	static get references() {
		return ["attached_terminal", 'occupied_by', 'attached_to', 'default_agent', 'allows_role'];
	}
}

module.exports = Workstation;