'use strict'
//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

class TicketApi extends CommonApi {
	constructor(cfg = {}) {
		super(cfg);
	}

	getBasicPriorities() {
		return super.getGlobal('priority_description');
	}

	getCodeLookup(code) {
		return super.getLookup('ticket', [code]);
	}

	setCodeLookup(ticket, code) {
		return super.setLookup('ticket', [code], ticket);
	}

	cacheServiceSlots(office, service, date, data, options) {
		return super.setCache('service_slots', [office, service, date], data, options);
	}

	getServiceSlotsCache(office, service, date) {
		return super.getCache('service_slots', [office, service, date]);
	}


	initContent() {
		super.initContent('Ticket');
		return this;
	}

	getTicket(query) {
		return super.getEntry('Ticket', query);
	}

	setTicketField(query, assignment, concat = false) {
		return super.setEntryField('Ticket', query, assignment, concat);
	}

	setTicket(data) {
		return super.setEntry('Ticket', data)
	}

	sort(tickets) {
		return _.orderBy(tickets, [(tick) => {
			return _.sum(_.map(tick.priority, 'value'));
		}, (tick) => {
			return (new Date(tick.booking_date))
				.getTime();
		}], ['desc', 'asc'])
	}
}

module.exports = TicketApi;