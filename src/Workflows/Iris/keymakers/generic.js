'use strict'

function generic(Model, finalizer = 'basic') {
	// console.log("GENERIC LD KM", Model.name, finalizer);
	let fin_keymaker = require("./index")(finalizer) || require("./index")('basic');
	return {
		get: (data) => {
			let result = data;
			if (data.query) {
				result.keys = [];
				result.query = Model.buildQuery(data.query);
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
				// console.log("DBSERIALIZED GENERIC", item.dbSerialize());
				return Model.buildDbData(t_data);
			});
			return fin_keymaker.set(result);
		}
	}
};

module.exports = generic;
