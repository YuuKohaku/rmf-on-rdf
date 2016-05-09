'use strict'

let BasicAccessorAsync = require('./BasicAccessorAsync.js');

class LDAccessor extends BasicAccessorAsync {
	constructor(data_provider) {
		super(data_provider);
	}
	set(data) {
		let access_obj = this.makeAccessObject('set', data);
		let values = [];
		let opts = {};
		if (access_obj.options && access_obj.values) {
			values = access_obj.values;
			opts = access_obj.options;
		} else {
			values = access_obj;
			opts = {};
		}

		return this.data_provider.set(values, opts);
	}
	get(context) {
		let access_obj = {
			options: context.options || {}
		};
		access_obj = _.assign(access_obj, this.makeAccessObject('get', context));
		
		return Promise.resolve(this.data_provider.get(access_obj));
	}

}

module.exports = LDAccessor;
