'use strict'

let Fieldset = require("./Fieldset");

class Ticket extends Fieldset {
	constructor() {
		let fields = ['pending_tasks', 'source', "qa_answers", 'time_description', 'operator', 'alt_operator', 'history', 'service', "code", "destination", 'org_destination', "booking_date", "dedicated_date", "priority", "state", "user_info", "service_count", "called", "expiry"];
		super(fields);
	}

	build(data) {
		super.build(data);
		if (_.isString(this.content_map.service_count))
			this.content_map.service_count = _.parseInt(this.content_map.service_count);
	}

	get references() {
		return ['pending_tasks', 'service', 'operator', 'alt_operator', 'destination', 'org_destination', 'source'];
	}

}

module.exports = Ticket;
