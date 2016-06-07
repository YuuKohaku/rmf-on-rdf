'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Roomdisplay extends DatabaseFieldset {
	static get fields(){
		return  ["default_agent", 'attached_to', "device_type", "occupied_by", "pop_on_arrival", "default_voice_duration", "silent_mode"];
	}

	static get references() {
		return ['attached_to', 'default_agent'];
	}
}

module.exports = Roomdisplay;
