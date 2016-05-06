'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Terminal extends DatabaseFieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "bound_service_groups", "occupied_by", "prebook_autoregister", "booking_methods", "reload_interval"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent', "bound_service_groups", "occupied_by"];
	}
}

module.exports = Terminal;
