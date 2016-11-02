'use strict';


// var ProxifyCollection = require(_base + '/build/externals/Proxify/Collection.js');
var ProxifyCollection = require('../../../externals/Proxify/Collection.js');

const default_collection_id = 'id';

class BaseCollection {
	constructor(collection_type, collection_id) {
		this.collection_type = collection_type;
		this.collection_id = collection_id || default_collection_id;

		// if (this.constructor.name == 'BaseCollection') return ProxifyCollection(this);
	}
	extend(id, data) {
		this.content[id] = data;
	}

	build(items) {
		// console.log("BCA BUILD", items);
		let Model = this.collection_type;
		this.content = _.reduce(items, (result, single_item, index) => {
			if (!single_item)
				return result;
			let obj = new Model();
			let key = single_item.key || index;
			obj.build(single_item);

			result[key] = obj;
			return result;
		}, {});
	}
	split(size, count) {
		let Me = this.constructor;
		let current = {};
		let result = [];

		_.forEach(this.content, (item, index) => {
			if (result.length == count) return false;

			current[index] = item;

			if (_.size(current) != size) return true;

			let obj = new Me(this.collection_type, this.collection_id);
			obj.content = current;
			current = {};
			result.push(obj);
		});

		return result;
	}

	// TEMPORARY COMMON METHOD SECTION
	observe(...args) {
		return this.collectionMethod('observe', ...args);
	}

	reserve(...args) {
		return this.collectionMethod('reserve', ...args);
	}

	free(...args) {
			return this.collectionMethod('free', ...args);
		}
		// END TEMPORARY COMMON METHOD SECTION

	collectionMethod(method_name, passed) {
		// console.log("COLLECTION METHOD", method_name, passed, this.collection_id);
		let ids = passed[this.collection_id];
		//@TODO: rework it later with iterators
		if (ids == '*') {
			ids = _.keys(this.content);
		} else
		if (_.isObject(ids) && !_.isArray(ids)) {
			let from = ids.from;
			let to = ids.to;
			let prefix = ids.prefix || '';
			ids = [];
			for (var i = from; i >= to; i++) {
				id.push(prefix + i);
			}
		} else {
			ids = _.castArray(ids);
		}
		// console.log("BC CM", this.collection_id, method_name, passed, ids, this.content);

		let Me = this.constructor;
		let result = new Me(this.collection_type, this.collection_id);
		let data = {};

		//@NOTE: generator will be here
		result.content = _.reduce(ids, (collection, id) => {
			if (!this.content[id])
				return collection;
			let observe = this.content[id][method_name](passed.selection);
			if (observe) collection[id] = observe;
			return collection;
		}, {});

		return result;
	}

	serialize() {
		return _.reduce(this.content, (result, item, key) => {
			let data = item.serialize();
			data.key = key;
			result[key] = data;
			return result;
		}, {})
	}
}

module.exports = BaseCollection;