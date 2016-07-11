'use strict'

let Plan = require('./Plan.js');
let Schedule = require('./Schedule.js');
let TemplateModel = Schedule;

class FieldsetPlan extends Plan {
	constructor(parent) {
		super(parent);
		this.template = new TemplateModel();
		if (parent && parent.template)
			this.template.build(parent.template.dbSerialize());
		this.mark = parent && _.clone(parent.getMark()) || {};
	}

	getMark() {
		return this.mark;
	}

	addMark(mark) {
		_.assign(this.mark, mark);
	}

	get fields() {
		return this.template.fields;
	}

	get references() {
		return this.template.references;
	}

	build(data) {
		// console.log("BUILDING PLAN", data);
		let build_data = data || [{
			data: [
				[0, 0]
			]
		}];
		let node = data;
		if (data.cas) {
			node = data.value;
		}
		//@FIXIT
		if (data.spec) {
			_.assign(this, data.spec);
		}
		if (node._mark) {
			this.addMark(node._mark);
		}
		if (node['@id']) {
			node['@type'] = "Plan";
			this.id = node["@id"];
			this.template.build(data);
			build_data = _.castArray(node.has_time_description);
		}
		super.build(build_data);
		return this;
	}

	serialize() {
		let data = super.serialize();
		let res = this.template.dbSerialize();
		res.has_time_description = data;
		// console.log("SERIALIZED RES FSP", res);
		return res;
	}

	free(params) {
		//@NOTE: proxy to parent if it exists
		let target = this.parent ? this.parent : this;

		if (!params) {
			//@NOTE: free all
			let status = true;
			let content = this.getContent();
			let result = [];
			for (let i in content) {
				let placed = target.put({
					data: content[i].serialize()
						.data,
					state: 'a'
				});
				if (!placed) {
					status = false;
					break;
				}
				result.push(placed);
			}
			if (status)
				this.stored_changes = this.stored_changes.concat(result);

			return status ? target : false;
		}

		let placed = target.put({
			data: params,
			state: 'a'
		});

		if (placed) {
			this.stored_changes.push(placed);
		}

		return placed ? target.defragment() : false;
	}

	intersection(plan) {
		let result = super.intersection(plan);
		if (plan instanceof this.constructor)
			result.addMark(plan.getMark());
		return result;
	}
	defragment() {
		this.sort();
		let cnt = [];
		_.forEach(this.content, (chunk) => {
			let prev = _.last(cnt);
			if (prev && prev.getState()
				.haveState('a') && chunk.getState()
				.haveState('a')) {
				let u = prev.union(chunk);
				if (u) {
					cnt = _.dropRight(cnt);
					cnt.push(u);
					return cnt;
				}
			}
			cnt.push(chunk);
		});
		this.content = cnt;
		return this;
	}

	getLength(state) {
		return _.reduce(this.content, (acc, chunk) => {
			return chunk.getState()
				.haveState(state || 'a') ? (acc + chunk.getLength()) : acc;
		}, 0);
	}

}

module.exports = FieldsetPlan;