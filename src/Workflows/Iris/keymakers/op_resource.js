'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQR", query);
		if (!query)
			return {};
		let plan_id = _.isString(query.dedicated_date) ? dedicated_date : query.dedicated_date.format("YYYY-MM-DD");
		let chain = [];
		let op_keys = query.actor == '*' ? query.actor_keys : _.intersection(_.castArray(query.actor), query.actor_keys);
		chain.push({
			name: "ops",
			transactional: true,
			in_keys: op_keys
		});
		chain.push({
			name: "schedules",
			out_keys: (ops) => {
				let schedules = {};
				_.map(ops, (op) => {
					if (!op)
						return;
					let sc = op.value && op.value.has_schedule && op.value.has_schedule.resource || [];
					if (sc.constructor !== Array)
						sc = [sc];
					let l = sc.length;
					while (l--) {
						if (!schedules[sc[l]]) {
							schedules[sc[l]] = true;
						}
					}
					schedules[`${op.value["@id"]}-${query.organization}-plan--${plan_id}`] = true;
				});
				return Object.keys(schedules);
			}
		});

		let req = {
			type: 'chain',
			key_depth: 1,
			query: chain,
			final: function (res) {
				// console.log("OPRESOURCFE", require('util')
				// 	.inspect(res, {
				// 		depth: null
				// 	}));
				let templates = {};
				let day = query.dedicated_date.format('dddd');
				let ops = _.map(_.compact(res.ops), "value");
				let schedules = _.map(res.schedules, "value");
				let reduced = _.reduce(ops, (acc, val) => {
					let key = val['@id'];
					let k = `${key}-${query.organization}-plan--${plan_id}`;
					let sch = _.find(schedules, (sch) => {
						return !!~_.indexOf(_.castArray((val && val.has_schedule && val.has_schedule.resource || [])), sch['@id']) && (!!~_.indexOf(sch.has_day, day) || !!~_.indexOf(sch.has_day, '*'));
					});
					if (!sch && query.allow_virtual) {
						sch = {
							"@id": k,
							"@type": "Plan",
							"has_day": ["*"],
							"has_time_description": {
								"data": [[0, 86400]],
								"state": "a"
							}
						};
					}
					if (sch) {
						sch = _.cloneDeep(sch);
						acc[key] = {};
						acc[key][k] = schedules[k];
						sch._mark = {};
						sch._mark[query.actor_type] = key;
						templates[key] = sch;
					}
					return acc;
				}, {});
				// console.log("RES FIN RESOURCE", reduced, templates);
				return {
					keys: reduced,
					templates
				};
			}
		};
		return {
			query: req
		};
	},
	set: function (data) {
		let access = [];
		let opts = {};
		_.map(_.values(data), (val) => {
				let node = val;
				let cas = val.cas;
				_.unset(val, 'key');
				_.unset(val, 'cas');
				access.push(node);
				if (cas) {
					opts[node['@id']] = {
						cas
					};
				}
			})
			// console.log("SETTING OTPLAN", access, data);
		return {
			values: {
				data: access
			},
			options: opts
		};
	}
};