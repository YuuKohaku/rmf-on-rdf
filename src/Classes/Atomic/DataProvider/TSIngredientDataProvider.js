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

		let time = process.hrtime();

		return this.ingredient.resolve({
				query: selection
			})
			.then((resolved) => {
				// had to choose between this outrageous notation and additional * queries to db
				// console.log("TSI", require('util')
				// 	.inspect(resolved.content_map, {
				// 		depth: null
				// 	}));
				let diff = process.hrtime(time);
				// console.log("INGREDIENT RESOLVE IN %d msec", (diff[0]*1e9 + diff[1])/1000000);
				time = process.hrtime();

				let observed = {
					services: resolved.getAtom(services_path)
						.observe({
							operator_id: selection.operator,
							selection: {
								service_id: selection.service,
								selection: time_description
							}
						}),
					ops: resolved.getAtom(ops_path)
						.observe({
							operator_id: selection.operator,
							selection: time_description
						}),
					plans: resolved.getAtom(plans_path)
						.observe({
							operator_id: selection.operator,
							selection: time_description
						})
				};

				diff = process.hrtime(time);
				// console.log("INGREDIENT OBSERVE IN %d msec", (diff[0]*1e9 + diff[1])/1000000);
				time = process.hrtime();

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
						op_services[s_id] = params.split ? plan.split(size, count) : plan;
						return op_services;
					}, {});
					return acc;
				}, {});
			})
			.then((res) => {
				let diff = process.hrtime(time);
				// console.log("FIN IN %d msec", (diff[0]*1e9 + diff[1])/1000000);
				return res;
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