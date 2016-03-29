'use strict'

let Fieldset = require("./Fieldset");

class DigitalDisplay extends Fieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "occupied_by", "maintains", "baud_rate", "data_bits", "parity", "stop_bits"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = DigitalDisplay;
