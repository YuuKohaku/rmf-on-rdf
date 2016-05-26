'use strict'
let base_dir = "../../../";
let CommonApi = require("./CommonApi");

class ServiceApi extends CommonApi {
	constructor(cfg = {}) {
		let config = _.merge({
			user_info_fields: 'user_info_fields',
			qa_questions: 'qa_questions'
		}, cfg);
		super({
			startpoint: config
		});
	}

	initContent() {
		super.initContent('Service');
		super.initContent('ServiceGroup');
		return this;
	}

	getUserInfoFields() {
		return this.db.get(this.startpoint.user_info_fields)
			.then((res) => (res.value.content));
	}

	getQaQuestions() {
		return this.db.get(this.startpoint.qa_questions)
			.then((res) => (res.value.content));
	}

	getServiceIds() {
		return super.getRegistry('service');
	}

	updateServiceIds(data) {
		return this.getGlobal("membership_description")
			.then((res) => {
				let keys = _.map(res, 'member');
				return this.getEntryTypeless(_.uniq(keys));
			})
			.then(res => {
				let data = _(res)
					.values()
					.compact()
					.flatMap('provides')
					.compact()
					.uniq()
					.value();
				return super.setRegistry('service', data);
			});
	}

	cacheServiceQuota(office, data, options = {}) {
		let q_res;
		let promises = [];
		// console.log("CACHE QUOTA", data);
		_.map(data, (day_data, day) => {
			// console.log("QUOTA PART", srv, day, day_data, options);
			promises.push(this.setCache('service_quota', [office, day], day_data, options))
		});
		return Promise.all(promises)
			.then((res) => {
				q_res = res;
				return super.setCache('service_quota', [office, 'timestamp'], _.now());
			})
			.then(res => q_res);
	}

	getServiceQuota(office, dates = []) {
		let days = _.compact(_.castArray(dates));

		let promises = {};
		_.map(days, day => {
			promises[day] = this.getCache('service_quota', [office, day]);
		});

		return Promise.props(promises)
			.then((res) => {
				// console.log("QUOTA GOT", res);
				let quota = {};
				_.map(res, (day_quota, index) => {
					_.set(quota, index, day_quota || {});
				});
				return quota;
			});
	}

	serviceQuotaExpired(office, allowed_interval) {
		return super.getCache('service_quota', [office, 'timestamp'])
			.then((res) => {
				let ts = _.parseInt(res);
				let expired = _.isNaN(ts) ? true : ((ts + allowed_interval) < _.now());
				return Promise.resolve(expired);
			});
	}

	lockQuota(office) {
		let name = super.getSystemName('cache', 'service_quota', [office, 'flag']);
		return this.db.get(name)
			.then(cnt => {
				if (cnt && (cnt.value > 0))
					return Promise.reject(new Error("Locked"));
				return this.db.counter(name, 1, {
					initial: 1,
					expiry: 60
				});
			});
	}
	unlockQuota(office) {
		let name = super.getSystemName('cache', 'service_quota', [office, 'flag']);
		return this.db.get(name)
			.then(cnt => {
				if (cnt && (cnt.value < 1))
					return true;
				return this.db.counter(name, -1, {
					initial: 0
				});
			});
	}
	getServiceTree(query) {
		let groups = {};
		let services = {};
		let direct = this.content['ServiceGroup'];
		let unroll = (keys) => {
			return direct.get({
					keys
				})
				.then((res) => {
					return Promise.props(_.mapValues(res, (val, key) => {
						if (!val)
							return Promise.resolve({});
						let type = val.value['@type'];
						let Model = this.models[type];
						let data = Model.buildSerialized(val);
						if (type === "ServiceGroup") {
							groups[key] = data;
							return unroll(data.content);
						}
						services[key] = data;
						return Promise.resolve(data);
					}));
				});
		}
		return this.getServiceGroup(query)
			.then((res) => {
				return unroll(_.keys(res))
					.then((res) => {
						let nested = _.map(groups, (val, key) => {
							let cnt = _.castArray(val.content);
							cnt = _.map(cnt, (key) => {
								return groups[key] || services[key];
							});
							return _.merge({}, val, {
								content: cnt
							});
						});
						let ordered = _.mapValues(_.groupBy(nested, 'view_name'), (val) => {
							return _.keyBy(val, (item) => {
								return (item.view_order == "0" || _.size(val) == 1) ? 'root' : item.id;
							});
						});
						// console.log("ORDERED", require('util').inspect(ordered, {
						// 	depth: null
						// }));
						return ordered;
					});
			});
	}
	getService(query) {
		return super.getEntry('Service', query);
	}
	setServiceField(query, assignment) {
		return super.setEntryField('Service', query, assignment);
	}
	setService(data) {
		return super.setEntry('Service', data);
	}
	getServiceGroup(query) {
		return super.getEntry('ServiceGroup', query);
	}
	setServiceGroupField(query, assignment) {
		return super.setEntryField('ServiceGroup', query, assignment);
	}
	setServiceGroup(data) {
		return super.setEntry('ServiceGroup', data);
	}
}
module.exports = ServiceApi;