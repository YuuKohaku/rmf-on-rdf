'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class UserInfo extends DatabaseFieldset {
	constructor() {
		let fields = ["phone", "first_name", "last_name", "middle_name", "address", "fio"];
		super(fields);
	}
}

module.exports = UserInfo;