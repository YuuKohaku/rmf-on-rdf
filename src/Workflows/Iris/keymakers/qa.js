'use strict'

let delimiter = '--';
let satellite_type = 'qa';
let makeKey = (...args) => {
	return _([satellite_type, 'satellite'])
		.concat(args)
		.join(delimiter);
};
let decomposeKey = (key) => {
	let parts = _.split(key, delimiter);
	return {
		satellite_type: parts[0],
		entity_type: parts[1],
		params: _(parts)
			.slice(2, _.size(parts) - 1)
			.value(),
		parent: _.last(parts),
		key,
		template: _(parts)
			.slice(0, _.size(parts) - 1)
			.concat('template')
			.join(delimiter)
	};
}

module.exports = {
	get: function ({
		query,
		keys
	}) {
		// console.log("QQT", query, keys);
		if ((!keys || _.isEmpty(keys)) && (!query || _.isEmpty(query)))
			return {};
		let parent;
		let chain = [];
		let templates = [];
		let satellites = [];
		let s_to_t = {};

		if (keys && !query) {
			let decomposed = _.map(keys, decomposeKey);
			templates = _(decomposed)
				.flatMap('template')
				.uniq()
				.value();
			satellites = _(decomposed)
				.flatMap('key')
				.uniq()
				.value();
			s_to_t = _.reduce(decomposed, (acc, val) => {
				acc[val.key] = val.template;
				return acc;
			}, {});

			// console.log("DECOMPOSED", decomposed);
			chain.push({
				name: "satellite",
				in_keys: satellites
			});
		} else {
			_.unset(query, "@id");
			parent = query.parent;
			chain.push({
				name: "parent",
				in_keys: [parent]
			});
			chain.push({
				name: "satellite",
				out_keys: (parent_data) => {
					let sup = parent_data[parent].value;
					templates.push(makeKey(sup.attached_to, 'template'));
					satellites.push(makeKey(sup.attached_to, parent));
					s_to_t[satellites[0]] = templates[0];
					// console.log("TS", tpl, stl, sup, parent_data);
					return satellites;
				}
			});
		}
		chain.push({
			name: "template",
			in_keys: templates
		});

		//limbo starts here
		let req = {
			type: 'chain',
			query: chain,
			final: function (res) {
				let satellites_data = _(res.satellite)
					.map('value')
					.keyBy('@id')
					.value();
				let templates_data = _(res.template)
					.map('value')
					.keyBy('@id')
					.value();
				// console.log("QA RES", res, satellites_data, templates_data);

				let keyed = _.mapValues(s_to_t, (t_key, s_key) => {
					let template = _.cloneDeep(templates_data[t_key]) || {};
					let current = satellites_data[s_key] || {
						'@id': s_key
					};
					return _.merge(template, current)
				});
				// console.log("REDUCED STl", keyed);
				return keyed;
			}
		};
		return {
			query: req
		};
	},
	set: (data) => {
		// console.log("SETTING TICK", access);
		return {};
	}
};
