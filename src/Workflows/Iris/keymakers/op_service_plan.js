'use strict'

module.exports = {
	get: function ({
		query
	}) {
		// console.log("QQ", query);
		if (!query)
			return {};
		let s_in_keys;
		let s_out_keys;
		let chain = [];
		let op_keys = query.actor == '*' ? query.actor_keys : _.intersection(query.actor, query.actor_keys);
		op_keys = _.concat(op_keys, query.service_keys)
		chain.push({
			name: "ops",
			transactional: true,
			in_keys: op_keys
		});
		if (query.service == '*') {
			s_out_keys = (ops) => {
				let mask = ops[query.service_keys] || [];
				_.unset(ops, query.service_keys);
				// console.log("SERVICES", _.intersection(_.flatMap(ops, "value.provides"), _.get(mask, "value.content", [])));
				let msk = _.get(mask, "value.content", false) || mask || [];
				let op_srvs = _.uniq(_.compact(_.flatMap(ops, (op) => (_.get(op, ['value', 'provides'], false) || msk))));
				return _.intersection(op_srvs, msk);
			};
		} else {
			s_in_keys = _.castArray(query.service);
		}
		chain.push({
			name: "services",
			transactional: true,
			in_keys: s_in_keys,
			out_keys: s_out_keys
		});
		chain.push({
			name: "schedules",
			transactional: true,
			out_keys: (servs) => {
				let schedules = _.map(servs, `value.has_schedule.${query.method}`);
				return _.uniq(_.flattenDeep(schedules));
			}
		});
		let req = {
			type: 'chain',
			key_depth: 2,
			query: chain,
			final: function (res) {
				let day = query.dedicated_date.format('dddd');
				let services = _.keyBy(_.map(res.services, "value"), "@id");
				let ops = _.keyBy(_.map(res.ops, "value"), "@id");
				let schedules = _.keyBy(_.map(res.schedules, "value"), "@id");
				let reduced = _.reduce(ops, (acc, val, key) => {
					acc[key] = _.reduce(val.provides || _.keys(services), (s_acc, s_id) => {
						let sch = _.find(schedules, (sch, sch_id) => {
							// console.log("SCH", sch_id, services[s_id], s_id, key);
							return services[s_id] && !!~_.indexOf(_.castArray(_.get(services, [s_id, 'has_schedule', query.method], [])), sch_id) && !!~_.indexOf(sch.has_day, day);
						});
						if (sch) {
							sch = _.cloneDeep(sch);
							sch._mark = {
								service: s_id
							};
							s_acc[s_id] = sch;
						}
						return s_acc;
					}, {});
					return acc;
				}, {});
				// console.log("REDUCED SPLANS", reduced);
				return reduced;
			}
		};

		return {
			query: req
		};
	}
};