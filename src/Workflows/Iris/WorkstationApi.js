'use strict'

//utility
let base_dir = "../../../";

//parent
let CommonApi = require("./CommonApi");

class WorkstationApi extends CommonApi {
	constructor(cfg = {}) {
		super(cfg);
	}

	initContent() {
		super.initContent('Workstation');
		super.initContent('Terminal');
		super.initContent('Roomdisplay');
		super.initContent('DigitalDisplay');
		super.initContent('Qa');
		super.initContent('Administrator');

		super.initContent('Organization');
		super.initContent('Schedule');

		return this;
	}

	cacheWorkstations() {
		return this.db.N1ql.direct({
				query: `SELECT  \`@id\` as id, \`@type\` as type, attached_to, occupied_by, device_type, provides, has_schedule, maintains FROM \`${this.db.bucket_name}\` WHERE attached_to IS NOT MISSING AND \`@type\` in ${JSON.stringify(_.keys(this.models))} ORDER BY type, id ASC`
			})
			.then((res) => {
				// console.log("CACHE RES", res);
				let data = _(res)
					.groupBy('device_type')
					.mapValues((val, d_type) => _.map(val, v => {
						v.active = !_.isEmpty(v.occupied_by);
						return v;
					}))
					.value();
				return super.setCache('workstations', [], data);
			});
	}
	getWorkstationsCache() {
		return super.getCache('workstations');
	}

	getOrganizationTree() {
		return super.getGlobal('org_structure');
	}

	getWorkstationOrganizationChain(org_key) {
		if (!org_key) return {};
		let org_keys = _.uniq(_.castArray(org_key));
		let orgs = {};
		return this.getOrganizationTree()
			.then((orgtree) => {
				let Organization = this.models["Organization"];
				orgs = _(orgtree)
					.map((v) => {
						let item = new Organization();
						item.build(v);
						return item.serialize();
					})
					.keyBy("id")
					.value();
				return _.reduce(org_keys, (acc, key) => {
					let org = orgs[key];
					acc[key] = {
						'0': org
					};
					let level = 1;
					while (org.unit_of) {
						acc[key][level] = org = orgs[org.unit_of];
						level++;
					}
					return acc;
				}, {});
			})
			.catch((err) => {
				console.log("WSOD ERR", err.stack);
			});
	}

	getWorkstationOrganizationSchedulesChain(org_key) {
		let prov;
		let time = process.hrtime();
		return this.getWorkstationOrganizationChain(org_key)
			.then((res) => {
				prov = res;
				let keys = _.map(_.values(prov), (p, key) => {
					return _.map(_.values(p), (org) => _.values(org.has_schedule));
				});
				keys = _.uniq(_.flattenDeep(keys));
				return super.getEntry("Schedule", {
					keys
				});
			})
			.then((res) => {
				return _.mapValues(prov, (p, key) => {
					return _.mapValues(p, (org) => {
						org.has_schedule = _.mapValues(org.has_schedule, (schedules, type) => _.values(_.pick(res, schedules)));
						return org;
					})
				});
				let diff = process.hrtime(time);
				console.log(' WOSD took %d nanoseconds', diff[0] * 1e9 + diff[1]);
				return result;
			});
	}

	getWorkstation(query) {
		let type = query.keys ? false : 'Workstation';
		return super.getEntry(type, query);
	}
	setWorkstationField(query, assignment, concat = true) {
		let type = query.keys ? false : 'Workstation';

		return super.setEntryField(type, query, assignment, concat);
	}
	setWorkstation(data) {
		return super.setEntry('Workstation', data);
	}
}

module.exports = WorkstationApi;
