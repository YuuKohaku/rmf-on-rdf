'use_strict'

let IrisBuilder = require("./Builder");
let IrisApi = require("./IrisApi");
let TicketApi = require("./TicketApi");

//temporary here
//@TODO make all this bullshit in a righteous way
class BookingApi extends IrisApi {
	constructor() {
		super();
	}
	initContent() {
		IrisBuilder.init(this.db, {
			default_slot_size: 15 * 3600
		});
		let rs = IrisBuilder.getResourceSource();
		let ingredients = {
			'ldplan': rs
		};
		this.transact = () => {
			rs.transact();
		};
		this.endTransact = () => {
			rs.endTransact();
		};
		this.ticket_api = new TicketApi();
		let box_storage = this.ticket_api.initContent()
			.getContent('Ticket');


		this.factory = IrisBuilder.getFactory(ingredients, box_storage, this.ticket_api.sort);
	}

	getContent() {
		return this.factory;
	}

	build(query, factory_params = {}) {
		this.factory.selector()
			.reset()
			.add()
			.id('<namespace>builder')
			.id('box')
			.query(query);
		return this.factory.build(factory_params);
	}

	observe(query, factory_params = {}) {
		return this.build(query, factory_params)
			.then((produced) => {
				return produced.observe({
					box_id: query.box_id || '*'
				});
			})
			.then((res) => {
				return res.getAtom(['<namespace>builder', 'box'])
					.serialize();
			});
	}

	reserve(data) {
		data.reserve = true;
		return this.factory.getAtom(['<namespace>builder', 'box'])
			.save(data);
	}

	confirm(data) {
		data.reserve = false;
		return this.factory.getAtom(['<namespace>builder', 'box'])
			.save(data);
	}

	sort(tickets) {
		return this.ticket_api.sort(tickets);
	}

}
module.exports = BookingApi;