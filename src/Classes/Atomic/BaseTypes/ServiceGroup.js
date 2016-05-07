'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class ServiceGroup extends DatabaseFieldset {
	static get fields(){
		return  ["view_order", "view_name", "icon", "content", "items_per_page"];
	}

	static get references() {
		return ['content'];
	}
}

module.exports = ServiceGroup;