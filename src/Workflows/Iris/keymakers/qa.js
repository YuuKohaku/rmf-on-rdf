'use strict'

let delimiter = '--';
let basic = require("./index")('basic');
let makeKey = (org, parent) => {
	return `qa--satellite--${org}--${parent}`;
};

module.exports = {
	get: function ({
		query,
		keys
	}) {
		// console.log("QQT", query, keys);
		if (keys && !query)
			return {
				keys
			};

		if (!query)
			return {};

		_.unset(query, "@id");
		//limbo starts here
		if (query.parent) {
			let chain = [];
			let tpl, stl;
			chain.push({
				name: "parent",
				in_keys: [query.parent]
			});
			chain.push({
				name: "satellite",
				out_keys: (parent_data) => {
					let sup = parent_data[query.parent].value;
					tpl = makeKey(sup.attached_to, 'template');
					stl = makeKey(sup.attached_to, query.parent);
					// console.log("TS", tpl, stl, sup, parent_data);
					return [tpl, stl];
				}
			});
			let req = {
				type: 'chain',
				query: chain,
				final: function (res) {
					let satellites = _(res.satellite)
						.map('value')
						.keyBy('@id')
						.value();
					// console.log("QA RES", res, satellites);
					let template = satellites[tpl];
					let current = satellites[stl] || {
						'@id': stl
					};
					let keyed = {};
					keyed[stl] = _.merge(template, current)
						// console.log("REDUCED STl", keyed);
					return keyed;
				}
			};
			return {
				query: req
			};
		} else {
			return basic.get({
				query
			});
		}
	},
	set: (data) => {
		// console.log("SETTING TICK", access);
		return {};
	}
};
