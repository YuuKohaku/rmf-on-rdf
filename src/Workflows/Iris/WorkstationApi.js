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

	getWorkstationsCache(org) {
		return super.getRegistry('workstation', [org])
			.then(registry => Promise.props(_.mapValues(registry, (ids) => this.getEntryTypeless(ids))));
	}


	getOrganizationTree() {
		return super.getGlobal('org_structure');
	}

	getOrganizationTimezones() {
		return this.getOrganizationTree()
			.then(res => {
				let keyed = _.keyBy(res, '@id');
				let get_tz = (id) => {
					return !id ? undefined : (keyed[id].org_timezone || get_tz(keyed[id].unit_of));
				}
				return _.reduce(res, (acc, val, key) => {
					acc[val['@id']] = get_tz(val['@id']);
					return acc;
				}, {});
			});
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
		let org_keys = _.compact(_.uniq(_.castArray(org_key)));
		let orgs = {};
		return this.getOrganizationTree()
			.then((orgtree) => {
				let Organization = this.models["Organization"];
				orgs = _(orgtree)
					.map((v) => {
						return Organization.buildSerialized(v);
					})
					.keyBy("id")
					.value();
				if (!org_key) org_keys = _.compact(_.keys(orgs));
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