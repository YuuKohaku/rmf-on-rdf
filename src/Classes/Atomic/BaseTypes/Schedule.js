'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Schedule extends DatabaseFieldset {
	static get fields(){
		return  ['has_time_description', "has_day"];
	}

	static get references() {
		return ["has_day", "has_owner"];
	}

	static buildSerialized(data){
		let serialized = super.buildSerialized(data);
		serialized.has_time_description = _.castArray(serialized.has_time_description);
		return  serialized;
	}

	build(data) {
		super.build(data);
		this.content_map.has_time_description = _.castArray(this.content_map.has_time_description);
	}
}

module.exports = Schedule;
