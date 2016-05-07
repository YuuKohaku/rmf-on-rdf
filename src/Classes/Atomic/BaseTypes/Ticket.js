'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Ticket extends DatabaseFieldset {
	constructor() {
		let fields = this.constructor.fields;
		super(fields);
	}

	static get fields(){
		return  ['pending_tasks', 'source', "qa_answers", 'time_description', 'operator', 'alt_operator', 'history', 'service', "code", "destination", 'org_destination', "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count", "called", "expiry"];
	}

	build(data) {
		super.build(data);
		if (_.isString(this.content_map.service_count))
			this.content_map.service_count = _.parseInt(this.content_map.service_count);
	}

	static get references() {
		return ['pending_tasks', 'service', 'operator', 'alt_operator', 'destination', 'org_destination', 'source'];
	}

}

module.exports = Ticket;
