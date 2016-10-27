'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQO", query);
		if (!query)
			return {};
		let chain = [];
		let op_keys = query.actor == '*' ? query.actor_keys : _.intersection(_.castArray(query.actor), query.actor_keys);
		chain.push({
			name: "ops",
			transactional: true,
			in_keys: op_keys
		});
		chain.push({
			name: "schedules",
			transactional: true,
			out_keys: (ops) => {
				// console.log("OPS", ops);
				let schedules = {};
				_.map(ops, (op) => {
					let sc = op && op.value && op.value.has_schedule && op.value.has_schedule[query.method] || [],
						l = sc.length;
					while (l--) {
						if (!schedules[sc[l]])
							schedules[sc[l]] = true;
					}
				});

				return Object.keys(schedules);
			}
		});
		let req = {
			type: 'chain',
			key_depth: 1,
			query: chain,
			final: function (res) {
				// console.log("OPLANS", require('util')
				// 	.inspect(res, {
				// 		depth: null
				// 	}));
				let day = query.dedicated_date.format('dddd');
				let ops = _.keyBy(_.map(res.ops, "value"), "@id");
				let schedules = _.keyBy(_.map(res.schedules, "value"), "@id");
				let reduced = _.reduce(ops, (acc, val, key) => {
					let sch = _.find(schedules, (sch, sch_id) => {
						// console.log("SCH", sch_id, key, day, !!~_.indexOf(_.castArray(val.has_schedule[query.method]), sch_id, _.castArray(val.has_schedule[query.method])));
						return !!~_.indexOf(_.castArray((val && val.has_schedule && val.has_schedule[query.method] || [])), sch_id) && !!~_.indexOf(sch.has_day, day);
					});
					if (sch) {
						sch = _.cloneDeep(sch);
						sch._mark = {};
						sch._mark[query.actor_type] = key;
						acc[key] = sch;
					}
					return acc;
				}, {});
				// console.log("REDUCED OPLANS", reduced);
				return reduced;
			}
		};
		return {
			query: req
		};
	}
};