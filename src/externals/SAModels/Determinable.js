'use strict'

let BasicValidator = require("./Validator/BasicValidator");
let Fieldset = require("./Fieldset");

class Determinable extends Fieldset {
	constructor(fields, validator_model = BasicValidator) {
		super(fields);
		this.validator = new BasicValidator(this.content_map);
	}

	valid() {
		return this.validator.validate();
	}

	invalidate(fieldname) {
		if(this.content_map[fieldname])
			this.content_map[fieldname] = undefined;
	}

}

module.exports = Determinable;