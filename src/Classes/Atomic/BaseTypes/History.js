'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class History extends DatabaseFieldset {
	constructor() {
		let fields = ["event_name", "time", "reason", "subject", "object", "local_time"];
		super(fields);
	}

	get references() {
		return ['subject', 'object'];
	}
}

module.exports = History;
