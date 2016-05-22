'use strict'

let getModel = require(base_dir + '/build/Classes/Atomic/type-discover.js')
	.dataType;

class Actor {
	constructor(actors) {
		this.actors = [];
		_.map(actors, a => {
			this.actor.push(getModel(a));
		});
	}

	// methods
}

module.exports = Actor;