'use strict'

let Fieldset = require("./Fieldset");

class Roomdisplay extends Fieldset {
	constructor() {
		let fields = ["default_agent", 'attached_to', "device_type", "occupied_by"];
		super(fields);
	}
	get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = Roomdisplay;