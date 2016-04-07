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
		super.initContent('PandoraBox');
		super.initContent('ControlPanel');
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
				query: `SELECT  \`@id\` as id, \`@type\` as type, attached_to, short_label, occupied_by, device_type, provides, has_schedule, maintains FROM \`${this.db.bucket_name}\` WHERE attached_to IS NOT MISSING AND \`@type\` in ${JSON.stringify(_.keys(this.models))} ORDER BY type, id ASC`
			})
			.then((res) => {
				// console.log("CACHE RES", res);
				let data = _(res)
					.groupBy('attached_to')
					.mapValues((val, d_type) => _.map(val, v => {
						v.active = !_.isEmpty(v.occupied_by);
						return v;
					}))
					.value();
				return Promise.props(_.mapValues(data, (org_data, org) => {
					return this.setCache('workstations', [org], _.groupBy(org_data, 'device_type'));
				}));
			});
	}
	getWorkstationsCache(org) {
		return super.getCache('workstations', [org]);
	}

	getOrganizationTree() {
		return super.getGlobal('org_structure');
	}

	getEntryTypeless(keys) {
		let type_reg = {};
		let typeless = [];
		_(keys)
			.castArray()
			.compact()
			.map((key) => {
				let type = _.upperFirst(_.camelCase(_.split(key, '--', 1)));
				if (!_.isUndefined(this.models[type])) {
					type_reg[type] = type_reg[type] || [];
					type_reg[type].push(key);
				} else {
					typeless.push(key);
				}
			})
			.value();
		let pack = _.mapValues(type_reg, (ks, type) => this.getEntry(type, {
			keys: ks
		}));
		pack.typeless = super.getEntryTypeless(typeless);
		return Promise.props(pack)
			.then((res) => {
				let data = _(res)
					.flatMap(_.values)
					.keyBy('id')
					.value();
				// console.log("TG RES", data);
				return data;
			})
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
