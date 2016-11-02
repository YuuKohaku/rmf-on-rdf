'use strict'

var _ = require('lodash');

var TimeChunk = require('./Primitive/TimeChunk.js');
var BasicVolume = require('./BasicVolume.js');
var ZeroDimensional = require('./ZeroDimensionalVolume.js');

class Plan extends BasicVolume {
	constructor(parent) {
		super(parent);
		this.PrimitiveVolume = TimeChunk;
	}
	sort() {
		this.content = _.sortBy(this.content, function (chunk) {
			return chunk.start;
		});
		return this;
	}

	/*=======================TEST===========================================*/
	observe(params = {}) { //@NOTE: test only
		if (_.isArray(params)) {
			let selection = this.buildPrimitiveVolume({
				data: [params]
			});

			return this.intersection(selection);
		} else if (_.isObject(params)) { //@TODO: rework this later
			if (!_.keys(params)
				.length) return this;

			//queried state or defult timechunk state
			let state = params.state || 'a';
			let plan = new this.constructor(this);

			let result = _.reduce(this.getContent(), (for_build, chunk) => {
				if (!chunk.getState()
					.haveState(state)) return for_build;

				for_build.push(chunk.serialize());
				return for_build;
			}, []);

			plan.build(result);

			return plan;
		}
	}

	reserve(params) {
		//@NOTE: proxy to parent if it exist
		let target = this.parent ? this.parent : this;

		if (!params) {
			//@NOTE: reserve all
			let status = true;
			let content = this.getContent();
			let result = [];
			for (let i in content) {
				let placed = target.put({
					data: content[i].serialize()
						.data,
					state: 'r'
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
			state: 'r'
		});

		if (placed) {
			this.stored_changes.push(placed);
		}

		return placed ? target : false;
	}

	rawIntersection(other_content = [], solid = false) {
		var result = [];
		_.forEach(this.getContent(), (chunk) => {
			_.forEach(other_content, (second_chunk) => {
				var local_intersection = chunk.intersection(second_chunk);
				if (local_intersection) result.push(solid ? chunk : local_intersection);
			});
		});
		return result;
	}

	/*=======================TEST===========================================*/

	intersection(plan, solid = false) {
		var other_content = []

		if (plan instanceof ZeroDimensional) {
			var state = plan.getContent()
				.getState();
			var chunk = new TimeChunk([
				[-Infinity, Infinity]
			], state);
			other_content = [chunk];
		} else
		if (plan instanceof Plan) {
			other_content = plan.getContent();
		} else
		if (plan instanceof TimeChunk) {
			other_content = [plan];
		}
		var result = this.rawIntersection(other_content, solid);
		var plan = new this.constructor(this);
		plan.build(result);

		return plan;
	}
	union(plan) {
		if (this.content.length == 0) return plan.copy();
		if (plan.content.length == 0) return this.copy();

		var f_n = this.negative();
		var s_n = plan.negative();

		return f_n.intersection(s_n)
			.negative();
	}
	negative() {
		var start = -Infinity,
			end;
		var result = [];

		_(this.content)
			.forEach((chunk, index) => {
				end = chunk.start;
				if (start != end) {
					result.push({
						data: [
						[start, end]
					],
						state: 'a'
					});
				}
				start = chunk.end;

			})
			.value();


		if (start != Infinity) {
			result.push({
				data: [
					[start, Infinity]
				],
				state: 'a'
			});
		}
		var plan = new this.constructor(this);
		plan.build(result);

		return plan;
	}
	copy() {
		var ch = _.map(this.content, (chunk) => chunk.serialize());
		var plan = new this.constructor(this);
		plan.build(ch);

		return plan;
	}
	split(size, count) {
		let result = [];
		let counter = 0;

		_.forEach(this.content, (chunk) => {

			_.forEach(chunk.split(size), (item) => {
				if (!item) return true;

				let plan = new this.constructor(this);
				plan.build([item]);

				result.push(plan);
				counter++;
				if (counter == count) return false;
			});
			if (counter == count) return false;
		});

		return result;
	}
}

module.exports = Plan;