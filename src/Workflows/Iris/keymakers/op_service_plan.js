'use strict'

module.exports = {
	get: function ({
		query
	}) {
		console.log("QQ", query);
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
				let msk = (mask.value && mask.value.content) || mask || [];
				let srv = {},
					l, service;
				_.map(ops, op => {
					if (op && op.value && op.value.provides) {
						l = op.value.provides.length;
						while (l--) {
							service = op.value.provides[l];
							if (!srv[service])
								srv[service] = true;
						}
					}

				});
				return srv['*'] ? msk : _.intersection(Object.keys(srv), msk);
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
				let schedules = {};
				_.map(servs, s => {
					let sc = s && s.value && s.value.has_schedule && s.value.has_schedule[query.method] || [],
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
			key_depth: 2,
			query: chain,
			final: function (res) {
				let day = query.dedicated_date.format('dddd');
				let all_services = [],
					map = {};
				let services = _.map(res.services, (srv, i) => {
					all_services.push(srv.value['@id']);
					map[srv.value['@id']] = i;
					return srv.value;
				});
				let ops = _.map(res.ops, "value");
				let schedules = _.map(res.schedules, "value");
				let reduced = _.reduce(ops, (acc, val) => {
					let provision = val.provides || [];
					if (provision === '*' || query.no_service_check) {
						provision = all_services;
					}
					acc[val['@id']] = _.reduce(provision, (s_acc, s_id) => {
						let sch = _.find(schedules, (sch) => {
							// console.log("SCH", sch_id, services[s_id], s_id, key);
							return services[map[s_id]] && !!~_.indexOf(_.castArray(services[map[s_id]].has_schedule && services[map[s_id]].has_schedule[query.method] || []), sch['@id']) && !!~_.indexOf(sch.has_day, day);
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