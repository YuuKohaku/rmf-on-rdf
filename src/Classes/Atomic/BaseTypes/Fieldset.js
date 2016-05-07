'use strict'

class Fieldset {
	constructor() {
		let props = _.concat(this.constructor.fields, Fieldset.fields);
		this.content_map = _.reduce(props, (acc, field) => {
			acc[field] = undefined;
			return acc;
		}, {});
	}

	get fields() {
		return _.keys(this.content_map);
	}

	static get fields() {
		return ["id", "type", 'label', "short_label", "description"];
	}

	build(data) {
		_.map(this.fields, (property) => {
			if (!_.isUndefined(data[property]))
				this.content_map[property] = data[property];
		});
		// console.log("BUILT FIELDSET", this.content_map, "FROM", data);
	}

	serialize() {
		let data = {};
		_.merge(data, this.content_map);
		return data;
	}

	static buildSerialized(data){
		let props = _.concat(this.fields, Fieldset.fields);
		return _.reduce(props, (content_map, property) => {
			if (!_.isUndefined(data[property]))
				content_map[property] = data[property];
			return content_map;
		}, {});
	}
}

module.exports = Fieldset;
