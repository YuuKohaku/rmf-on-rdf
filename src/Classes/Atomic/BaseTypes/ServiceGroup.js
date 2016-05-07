'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class ServiceGroup extends DatabaseFieldset {
	constructor() {
		let fields = this.constructor.fields;
		super(fields);
	}

	static get fields(){
		return  ["view_order", "view_name", "icon", "content", "items_per_page"];
	}

	static get references() {
		return ['content'];
	}
}

module.exports = ServiceGroup;