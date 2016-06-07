'use strict'

let DocumentFactory = require('./DocumentFactory.js');

class Document {
	constructor(database_handler) {
		// _db provides get, upsert, insert, replace, remove, counter etc.
		this._db = database_handler;
		this.pre_hooks = {};
		this.post_hooks = {};
		this.fields = {};
		this.system_fields = {};
	}

	// methods
	buildFromId(id) {
		return this._db.getMulti(id)
			.then((doc) => {
				let val = doc && doc[id] && doc[id].value;
				if (!val)
					return Promise.reject(new Error('Failed to find specified document: ' + id));
				this.buildFromData(doc[id]);
				return this;
			});
	}

	buildFromData(doc) {
		if (doc.cas && doc.value) {
			this.cas = doc.cas;
			this.fields = _.pickBy(doc.value, (v, k) => !_.startsWith(k, '@'));
			this.system_fields.id = doc.value['@id'];
			this.system_fields.type = doc.value['@type'];
		} else {
			this.fields = doc;
		}
		return this;
	}

	save(options) {
		if (!this.system_fields.id)
			throw new Error('Cannot save a doc without id');
		let data = this.fields;
		data['@id'] = this.system_fields.id;
		data['@type'] = this.system_fields.type;
		return this.db.upsert(this.system_fields.id, data, options)
			.then((res) => {
				console.log(res);
				this.cas = res.cas;
				return this;
			});
	}

	resolve(field, depth = 0) {
		let key = _.toString(field);
		if (field && !this.field[key])
			throw new Error('No such field in doc: ' + field);
		let val = this.field[key];
		let curr_depth = 0;
		let recurse = function (fields, depth) {
			if (_.isString(fields)) {
				let ret = new Document();
				return ret.buildFromId(fields);
			}
			if (_.isArray(fields)) {
				return this._db.getMulti()
			}
		}

	}

	preHook(field, fn) {
		if (field && _.isFunction(fn))
			this.pre_hooks[_.toString(field)] = fn;
		else
			throw new Error('Hook must be a function');
	}

	postHook(field, fn) {
		if (field && _.isFunction(fn))
			this.post_hooks[_.toString(field)] = fn;
		else
			throw new Error('Hook must be a function');
	}

	setField(field, value) {
		if (!field)
			throw new Error('Fieldname must be specified');
		this.fields[field] = value;
	}
}

module.exports = Document;