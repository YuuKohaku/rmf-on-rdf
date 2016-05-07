'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class DigitalDisplay extends DatabaseFieldset {
	static get fields() {
		return ["default_agent", 'attached_to', "device_type", "occupied_by", "maintains", "display_type", "symbol_depth", "y_offset", "x_offset", "height", "width", "baud_rate", "data_bits", "parity", "stop_bits"];
	}
	
	static get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = DigitalDisplay;
