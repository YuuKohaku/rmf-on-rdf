'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class History extends DatabaseFieldset {
	static get fields(){
		return  ["event_name", "time", "reason", "subject", "object", "local_time"];
	}

	static get references() {
		return ['subject', 'object'];
	}
}

module.exports = History;
