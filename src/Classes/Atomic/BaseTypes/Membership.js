'use strict'

let DatabaseFieldset = require("./DatabaseFieldset");

class Membership extends DatabaseFieldset {
	constructor() {
		let fields = this.constructor.fields;
		super(fields);
	}

	static get fields(){
		return   ["organization", "member", "role"];
	}

	static get references(){
		return   ["organization", "member", "role"];		
	}
}

module.exports = Membership;