'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Schedule extends DatabaseFieldset {
	constructor() {
		let fields = this.constructor.fields;
		super(fields);
	}

	static get fields(){
		return  ['has_time_description', "has_day"];
	}

	static get references() {
		return ["has_day", "has_owner"];
	}

	build(data) {
		super.build(data);
		this.content_map.has_time_description = _.castArray(this.content_map.has_time_description);
	}
}

module.exports = Schedule;
