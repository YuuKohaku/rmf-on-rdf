'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class UserInfo extends DatabaseFieldset {
	constructor() {
		let fields = this.constructor.fields;
		super(fields);
	}

	static get fields(){
		return  ["phone", "first_name", "last_name", "middle_name", "address", "fio"];
	}
}

module.exports = UserInfo;