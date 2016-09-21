'use strict'

let delimiter = '--';
let basic = require("./index")('basic');
let makeKey = (org, dedicated_date) => {
	let dd = _.isString(dedicated_date) ? dedicated_date : dedicated_date.format("YYYY-MM-DD");
	return `ticket-${org}-${dd}`;
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
		if (query.dedicated_date) {
			let chain = [];
			let key = makeKey(query.org_destination, query.dedicated_date);
			let c_key = `counter-${key}`;
			// console.log("CKEY", c_key);
			chain.push({
				name: "counter",
				in_keys: [c_key]
			});
			chain.push({
				name: "tickets",
				out_keys: (max) => {
					let nums = _.get(max, `${c_key}.value`, 0) + 1;
					// console.log("TICKS", _.map(_.range(nums), (num) => `${key}${delimiter}${num}`));
					return _.map(_.range(nums), (num) => `${key}${delimiter}${num}`);
				}
			});
			let req = {
				type: 'chain',
				query: chain,
				final: function (res) {
					// console.log(":FOUND TICKS", res);
					_.unset(query, 'dedicated_date');
					let filtered = _.filter(_.compact(res.tickets), (tick) => {
						return _.reduce(query, (acc, val, key) => {
							let res = true;
							// console.log("COMPARING", key, val, tick[key]);
							if (!_.isPlainObject(val)) {
								//OR
								res = !_.isEmpty(_.intersection(_.castArray(val), _.castArray(tick.value[key])));
							} else {
								res = _.isEqual(val, tick.value[key]);
							}
							return res && acc;
						}, true);
					});
					let keyed = _.keyBy(filtered, "value.@id");
					// console.log("REDUCED TICKS", keyed);
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
		// console.log("SETTING TICK", data);
		if (_.every(data, (d) => !_.isUndefined(d["@id"]) && d['@id'][d['@id'].length - 1] != '*')) {
			let options = {};
			let access = _.map(data, (item) => {
				let entity = item;
				if (entity.cas)
					options[entity['@id']] = {
						cas: entity.cas
					};
				_.unset(entity, 'cas');
				return entity;
			});
			// console.log("CHANGE TICK", access, options);
			return {
				values: {
					data: access
				},
				options
			};
		}
		let access = _.map(data, (entity) => {
			_.unset(entity, 'cas');
			let dedicated_date = _.isString(entity.dedicated_date) ? entity.dedicated_date : entity.dedicated_date.format("YYYY-MM-DD");
			entity.dedicated_date = dedicated_date;
			entity["@id"] = makeKey(entity.org_destination, dedicated_date);
			return entity;
		});
		return {
			type: 'counter',
			delimiter,
			counter_options: {
				initial: 0
			},
			data: access
		};
	}
};