'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Reception extends DatabaseFieldset {
	static get fields() {
		return ["attached_terminal", "occupied_by", "default_agent", "attached_to",
				 "device_sound", "device_design", "device_type", "digital_display_address",
				 "device_placement", "state", "ticket_design"];
	}

	static get references() {
		return ["attached_terminal", 'occupied_by', 'attached_to', 'default_agent', 'allows_role'];
	}
}

module.exports = Reception;