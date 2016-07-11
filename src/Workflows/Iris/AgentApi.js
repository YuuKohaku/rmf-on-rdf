'use strict'

//parent
let CommonApi = require("./CommonApi");

class AgentApi extends CommonApi {
	constructor(cfg = {}) {
		super(cfg);
	}

	cacheActiveAgents() {

		return this.getGlobal("membership_description")
			.then((res) => {
				let keys = _.map(res, 'member');
				return this.getEntryTypeless(_.uniq(keys));
			})
			.then(res => {
				let data = _(res)
					.values()
					.compact()
					.filter((v) => (v.state == 'active' || v.state == 'paused'))
					.groupBy('type')
					.mapValues((vals, type) => _(vals)
						.groupBy('state')
						.mapValues((v, state) => _.map(v, 'id'))
						.value())
					.value();
				return super.setCache('active_agents', [], data);
			});
	}

	getAgentKeys(organization, role) {
		return this.getGlobal("membership_description")
			.then((res) => {
				let ag = res;
				ag = _.filter(res, mm => {
					if (organization && mm.organization != organization) return false;
					if (role && mm.role != role) return false;
					return true;
				});
				return _.uniq(_.map(ag, 'member'));
			})
	}

	getActiveAgents() {
		return super.getCache('active_agents');
	}
	getAgentPermissions() {
		return super.getGlobal('agent_permissions');
	}
	initContent() {
		super.initContent('Employee');
		super.initContent('Spirit');
		super.initContent('SystemEntity');
		return this;
	}

	getEmployee(query) {
		return super.getEntry('Employee', query);
	}

	setEmployeeField(query, assignment) {
		return super.setEntryField('Employee', query, assignment);
	}

	setEmployee(data) {
		return super.setEntry('Employee', data);
	}
}

module.exports = AgentApi;