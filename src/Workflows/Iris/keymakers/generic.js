'use strict'

function generic(Model, finalizer = 'basic') {
	// console.log("GENERIC LD KM", Model.name, finalizer);
	let fin_keymaker = require("./index")(finalizer) || require("./index")('basic');
	return {
		get: (data) => {
			let result = data;
			if (data.query) {
				let item = new Model();
				item.build(data.query);
				result.keys = [];
				result.query = item.getAsQuery();
				result.select = data.select;
				// console.log("GKM ASQUERY", result, data);
			}
			if (data.keys) {
				result.keys = data.keys;
				// console.log("GKM ASKEYS", result, data);
			}

			return fin_keymaker.get(result);
		},
		set: (data) => {
			let items = _.castArray(data);
			let result = _.map(items, (t_data) => {
				let item = new Model();
				item.build(t_data);
				// console.log("DBSERIALIZED GENERIC", item.dbSerialize());
				return item.dbSerialize();
			});
			return fin_keymaker.set(result);
		}
	}
};

module.exports = generic;
