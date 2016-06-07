'use strict'

let Fieldset = require("./Fieldset");

class UnboundFieldset extends Fieldset {
	constructor() {
		super([]);
	}

	build(data) {
		this.content_map = _.merge(this.content_map, data);
	}
}

module.exports = UnboundFieldset;