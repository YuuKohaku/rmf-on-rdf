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

	getExpiredTickets(now) {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` as id FROM \`${this.db.bucket_name}\` WHERE  \`@type\`='Ticket' and (\`state\`="booked" ) and \`expiry\`< ${now} ORDER BY id ASC`
			})
			.then((res) => _.map(res, 'id'))
			.catch(err => []);
	}

	getCodeLookup(code) {
		return super.getLookup('ticket', [code]);
	}

	setCodeLookup(ticket, code) {
		return super.setLookup('ticket', [code], ticket);
	}

	cacheServiceSlots(data) {
		return super.setCache('service_slots', [], data);
	}

	getServiceSlotsCache() {
		return super.getCache('service_slots');
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
