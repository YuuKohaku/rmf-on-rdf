'use strict'

var ProxifyEntity = require('../../../externals/Proxify/Entity.js');

class RawEntity {
	constructor(entity_type) {
		this.entity_type = entity_type;
		this.content = {};
		if (this.constructor.name == 'RawEntity') return ProxifyEntity(this);
	}

	build(data) {
		let Model = this.entity_type;
		let entity = new Model();
		let content_map = {};
		let build_data = data;
		if (data.value) {
			//construct from db
			entity.cas = data.cas;
			//meh
			build_data = data.value;
			content_map.id = build_data['@id'];
			//@TODO use it wisely
			content_map.type = build_data['@type'];
		} else {
			content_map.type = data.type || data['@type'] || this.entity_type.name;
			content_map.id = data.id || data['@id'];
			entity.cas = data.cas;
		}
		_.map(entity.fields, (key) => {
			if (_.isUndefined(build_data[key])) return;
			content_map[key] = build_data[key];
		});

		// console.log("RE CM", data, entity);
		this.content = entity.build(content_map) || entity;
	}

	serialize() {
		let data = this.content.serialize();
		data.cas = this.content.cas;
		data.class = this.entity_type.name;
		return data;
	}

	transformKeys() {
		let data = this.serialize();
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
		return _.isFunction(this.content.transformKeys) ? this.content.transformKeys(db_data) : db_data;
	}


	dbSerialize() {
		let db_data = this.transformKeys();
		return _.isFunction(this.content.dbSerialize) ? this.content.dbSerialize(db_data) : db_data;
	}


	getAsQuery() {
		let data = this.transformKeys();
		let db_data = _.reduce(data, (acc, val, key) => {
			if (!_.isUndefined(val)) acc[key] = val;
			return acc;
		}, {});
		return _.isFunction(this.content.getAsQuery) ? this.content.getAsQuery(db_data) : db_data;
	}

	observe() {
		return this;
	}

}

module.exports = RawEntity;
