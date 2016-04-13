'use strict'

var _ = require('lodash');

// var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');
var ProxifyCollection = require('../../../externals/Proxify/Collection.js');
var Hashmap = require('./Hashmap.js');

class Box extends Hashmap {
	constructor(models, hash_id) {
		super(models, hash_id);

		if(this.constructor.name == 'Box') return ProxifyCollection(this);
	}

	build(items) {
		this.content = _.reduce(this.collection_type, (result, Model, index) => {
			let obj = null;
			obj = new Model();
			obj.build(items[index]);

			result[index] = obj;
			return result;
		}, {});
		this.resolve_params = items.resolve_params;
		return this;
	}

	collectionMethod(method_name, passed) {
		let ids = passed[this.collection_id];
		ids = _.castArray(ids);
		let Me = this.constructor;
		let result = new Me(this.collection_type, this.collection_id);
		let data = {};

		let collection = {};
		let empty = false;

		result.resolve_params = this.resolve_params;

		//@NOTE: generator will be here
		if(!passed.selection) {
			result.content = this.content;
			return result;
		}

		for(var i = 0; i < ids.length; i += 1) {
			let id = ids[i];
			collection[id] = this.content[id][method_name](passed.selection[id]);
			if(!collection[id] || collection[id].content.length == 0) {
				empty = true;
				break;
			}
		}

		result.content = collection;
		return empty ? undefined : result;
	}
	reserve(params) {
		//@TODO it might be that it is worth to rework collectionMethod
		// depends on how much 'exclusive' methods Box will need to hack into process
		var p = {};

		p[this.collection_id] = _.keys(this.collection_type);
		p.selection = params ||
			_.reduce(p[this.collection_id], (acc, val) => {
				acc[val] = undefined;
				return acc;
			}, {});

		return this.reserve(p);
	}
	serialize() {
		let res = _.reduce(this.content, (result, item, key) => {
			let data = item.serialize();
			data.key = key;
			data.resolve_params = this.resolve_params[key];
			result[key] = data;
			return result;
		}, {});
		return res;
	}
}

module.exports = Box;
