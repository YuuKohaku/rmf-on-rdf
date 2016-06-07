'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQO", query);
		if (!query)
			return {};
		let chain = [];
		let m_key = query.operator_keys;
		chain.push({
			name: "mm",
			transactional: true,
			in_keys: [m_key]
		});
		chain.push({
			name: "ops",
			transactional: true,
			out_keys: (md) => {
				// console.log("MD", md);
				let ops = _.map(_.filter(_.get(md[m_key], 'value.content', false) || md[m_key], (mm) => (mm.role == "Operator" && mm.organization == query.organization)), "member");
				let op_keys = _.uniq(_.flattenDeep(ops));
				return (query.operator == '*') ? op_keys : _.intersection(op_keys, _.castArray(query.operator));
			}
		});
		chain.push({
			name: "schedules",
			transactional: true,
			out_keys: (ops) => {
				// console.log("OPS", ops);
				let schedules = _.map(ops, (op) => _.get(op, `value.has_schedule.${query.method}`, []));
				return _.uniq(_.flattenDeep(schedules));
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
						return !!~_.indexOf(_.castArray(val.has_schedule[query.method]), sch_id) && !!~_.indexOf(sch.has_day, day);
					});
					if (sch)
						acc[key] = sch;
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