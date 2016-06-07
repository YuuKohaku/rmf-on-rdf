'use strict'

class Document {
	constructor(database_handler) {
		// _db provides get, upsert, insert, replace, remove, counter etc.
		this._db = database_handler;
		this.pre_hooks = {};
		this.post_hooks = {};
		this.fields = {};
	}

	// methods
	buildFromId(id) {
		return this._db.get(id)
			.then((doc) => {
				let val = doc && doc.value;
				if (!val)
					return Promise.reject('Failed to find specified document: ' + id);
				this.id = val['@id'];
				this.model_name = val['@type'];

			});
	}

	resolve(field, depth = 0) {
		if (field && !this.field[_.toString(field)])
			throw new Error('No such field in doc: ' + field);
		let val = this.field[_.toString(field)];
		if (_.isString(val)) {
			return this._db
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

	setField(field) {

	}
}