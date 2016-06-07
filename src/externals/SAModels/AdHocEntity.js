'use strict'

var ProxifyEntity = require('../../../externals/Proxify/Entity.js');

class AdHocEntity {
	constructor(type, discover) {
		//@TODO implement translator
		this.discover = discover;
		this.entity_type = type;
		this.content = {};
		if(this.constructor.name == 'AdHocEntity') return ProxifyEntity(this);
	}

	build(data) {
		let content_map = {};
		let pass = {};
		if(data.value) {
			pass.cas = data.cas;
			let db_data = data.value;
			content_map.id = db_data['@id'];
			content_map.type = db_data['@type'];

			_.map(db_data, (val, key) => {
				content_map[key] = _.size(db_data[key]) == 1 ? db_data[key][0] : db_data[key];
			});
		} else {
			content_map = data;
			content_map.type = data.type || data['@type'] || this.entity_type.name;
			content_map.id = data.id || data['@id'];
		}
		// console.log("AHE BUILD", content_map, data);
		let Model = this.discover(content_map.type) || this.entity_type;
		let entity = new Model();
		_.assign(entity, pass);
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
			if(key == 'id') {
				acc['@id'] = val;
			} else if(key == 'type') {
				acc['@type'] = val || data.class;
			} else if(key == 'cas') {
				acc.cas = val;
			} else if(!_.includes(['class'], key)) {
				acc[key] = val;
			}
			return acc;
		}, {});
		// console.log("KT", db_data);
		return db_data;
	}


	dbSerialize() {
		let db_data = this.transformKeys();
		_.map(db_data, (val, key) => {
			if(!_.startsWith(key, "@") && key !== 'cas') {
				db_data[key] = _.castArray(db_data[key]);
			}
		})
		return _.isFunction(this.content.dbSerialize) ? this.content.dbSerialize(db_data) : db_data;
	}


	getAsQuery() {
		let data = this.transformKeys();
		let db_data = _.reduce(data, (acc, val, key) => {
			if(!_.isUndefined(val)) acc[key] = val;
			return acc;
		}, {});
		return _.isFunction(this.content.getAsQuery) ? this.content.getAsQuery(db_data) : db_data;
	}

	observe() {
		return this;
	}

}

module.exports = AdHocEntity;