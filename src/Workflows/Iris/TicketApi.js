'use strict'
//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");
let keymakers = require("./keymakers");
let TicketModel = require(base_dir + 'build/Classes/Atomic/BaseTypes/Ticket.js');
let TicketDataProvider = require(base_dir + 'build/externals/TicketDataProvider');
let LDAccessor = require(base_dir + 'build/Classes/Atomic/Accessor/LDAccessor');

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
		console.log("INIT");
		let ModelName = "Ticket";
		let dp = new TicketDataProvider(this.db, message_bus);
		let Model = TicketModel;
		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic')(Model, "ticket")
				.set)
			.keymaker('get', keymakers('generic')(Model, "ticket")
				.get);


		//@NOTE: actually not content, but atomic
		this.content[ModelName] = storage_accessor;
		this.models[ModelName] = Model;
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
			return moment(tick.booking_date)
				.unix();
		}], ['desc', 'asc'])
	}
}

module.exports = TicketApi;