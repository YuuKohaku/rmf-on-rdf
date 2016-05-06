'use strict'
let Fieldset = require("./Fieldset");

class DatabaseFieldset extends Fieldset{

	build(data) {
		let content_map = {};
		let build_data = data;
		if (data.value) {
			//construct from db
			this.cas = data.cas;
			//meh
			build_data = data.value;
			content_map.id = build_data['@id'];
			//@TODO use it wisely
			content_map.type = build_data['@type'];
		} else {
			content_map.type = data.type || data['@type'] || this.constructor.name;
			content_map.id = data.id || data['@id'];
			this.cas = data.cas;
		}
		_.map(this.fields, (key) => {
			if (_.isUndefined(build_data[key])) return;
			content_map[key] = build_data[key];
		});

		// console.log("RE CM", data, entity);
		return super.build(content_map);
	}

	serialize() {
		let data = super.serialize();
		data.cas = this.cas;
		data.class = this.constructor.name;
		return data;
	}


	transformKeys() {
		let data = super.serialize();
		let db_data = _.reduce(data, (acc, val, key) => {
			if (key == 'id') {
				acc['@id'] = val;
			} else if (key == 'type') {
				acc['@type'] = val || data.class;
			} else if (key == 'cas') {
				acc.cas = val;
			} else if (!_.includes(['class'], key)) {
				acc[key] = val;
			}
			return acc;
		}, {});
		// console.log("KT", db_data, this.content);
		return db_data;
	}


	dbSerialize() {
		let db_data = this.transformKeys();
		return db_data;
	}


	getAsQuery() {
		let data = this.transformKeys();
		let db_data = _.reduce(data, (acc, val, key) => {
			if (!_.isUndefined(val)) acc[key] = val;
			return acc;
		}, {});
		return  db_data;
	}

	observe(){
		return this;
	}
}

module.exports = DatabaseFieldset;
