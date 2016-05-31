'use strict'

let IngredientDataProvider = require("./IngredientDataProvider");

class TSIngredientDataProvider extends IngredientDataProvider {
	constructor(size) {
		super(size);
	}

	setIngredient(property, resource_source) {
		this.property = property;
		this.ingredient = resource_source;
		return this;
	}

	setTransactor(fn_start, fn_end) {
		this.transact = fn_start;
		this.endTransact = fn_end;
		return this;
	}

	get(params) {
		// console.log("I_GET", require('util')
		// 	.inspect(params, {
		// 		depth: null
		// 	}));
		let count = params.count;
		let size = params.size || this.size;
		let selection = params.selection[this.property];
		let plans_path = ['<namespace>content', 'plan'];
		let ops_path = ['<namespace>content', 'operators'];
		let services_path = ['<namespace>attribute', 'services'];

		let service_id = selection.service;
		let time_description = selection.time_description;

		let resolve = [this.ingredient.getAtom(services_path), this.ingredient.getAtom(ops_path), this.ingredient.getAtom(plans_path)];
		// return this.ingredient.resolve({
		// 		query: selection
		// 	})
		return Promise.mapSeries(resolve, r => r.resolve({
				query: selection
			}))
			.then((resolved) => {
				// this.endTransact();
				// let observed = {
				// 	services: resolved.getAtom(services_path)
				// 		.observe({
				// 			operator_id: selection.operator,
				// 			selection: {
				// 				service_id: selection.service,
				// 				selection: time_description
				// 			}
				// 		}),
				// 	ops: resolved.getAtom(ops_path)
				// 		.observe({
				// 			operator_id: selection.operator,
				// 			selection: time_description
				// 		}),
				// 	plans: resolved.getAtom(plans_path)
				// 		.observe({
				// 			operator_id: selection.operator,
				// 			selection: time_description
				// 		})
				// };
				let observed = {
					services: resolved[0]
						.observe({
							operator_id: selection.operator,
							selection: {
								service_id: selection.service,
								selection: time_description
							}
						}),
					ops: resolved[1]
						.observe({
							operator_id: selection.operator,
							selection: time_description
						}),
					plans: resolved[2]
						.observe({
							operator_id: selection.operator,
							selection: time_description
						})
				};
				let services = observed.services.content;
				let ops = observed.ops.content;
				let plans = observed.plans.content;
				// console.log("TSI II", require('util')
				// 	.inspect(plans, {
				// 		depth: null
				// 	}));
				return _.reduce(services, (acc, s_plans, op_id) => {
					if (!(plans[op_id] && ops[op_id]))
						return acc;
					let op_plan = plans[op_id].intersection(ops[op_id]);
					let s_ids = (service_id == '*' || !service_id) ? _.keys(s_plans.content) : service_id;
					s_ids = _.castArray(s_ids);
					acc[op_id] = _.reduce(s_ids, (op_services, s_id) => {
						let plan = op_plan.intersection(s_plans.content[s_id]);
						op_services[s_id] = plan;
						plan.slot_size = _.get(s_plans.content[s_id], 'parent.template.slot_size');
						return op_services;
					}, {});
					return acc;
				}, {});
			});
	}

	free(params, value) {
		let plans_path = ['<namespace>content', 'plan'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);
		let selection = params.selection[this.property];

		return ingredient_atom.resolve({
				query: {
					operator: value.operator,
					dedicated_date: selection.dedicated_date,
					operator_keys: selection.operator_keys,
					organization: value.org_destination
				}
			})
			.then((resolved) => {
				resolved.free({
					operator_id: value.operator,
					selection: [value.time_description]
				});
				return ingredient_atom.save(resolved);
			})
			.then((saved) => {
				return saved || false;
			})
			.catch((err) => {
				console.error(err.stack);
				return false;
			});
	}
	set(params, value) {
		// console.log("I_SET", params, value);
		let plans_path = ['<namespace>content', 'plan'];
		let ingredient_atom = this.ingredient.getAtom(plans_path);
		let data = _.castArray(value);
		let selection = params.selection[this.property];
		let saving_meta = {};

		return ingredient_atom.resolve({
				query: selection
			})
			.then((resolved) => {
				_.map(data, (tick) => {
					// console.log("RESOLVED", tick.time_description, require('util')
					// 	.inspect(resolved.content, {
					// 		depth: null
					// 	}));
					resolved.reserve({
						operator_id: tick.operator,
						selection: [tick.time_description]
					});
					// console.log("RESOLVED II", tick, require('util')
					// 	.inspect(resolved.content[tick.operator], {
					// 		depth: null
					// 	}));
					saving_meta[tick.id] = resolved.content[tick.operator].id;
					// console.log("META", saving_meta);
				});
				return ingredient_atom.save(resolved);
			})
			.then((saved) => {
				return saving_meta || false;
			})
			.catch((err) => {
				console.error(err.stack);
				return false;
			});
	}
}

module.exports = TSIngredientDataProvider;