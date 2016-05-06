'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Membership extends DatabaseFieldset {
	constructor() {
		let fields = ["organization", "member", "role"];
		super(fields);
	}
}

module.exports = Membership;