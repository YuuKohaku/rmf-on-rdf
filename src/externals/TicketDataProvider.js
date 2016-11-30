'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

	constructor(bucket, bus) {
		super();
		this._bucket = bucket;
		this._emitter = bus;
	}

	get({
		keys: out_keys,
		query,
		options
	}) {
		console.log("CBLDP GET", out_keys, query, options);
		if (query && options.today) {
			return this._emitter.addTask("ticket-index", {
				_action: "query-today-tickets",
				organization: query.org_destination,
				query: query,
				active_sessions_only: true
			});
		}
		if (query) {
			return this.process_chain(query, options);
		}
		return this._bucket.getNodes(_.castArray(out_keys), options);
	}

	process_chain(q, options) {
		return Promise.reduce(q.query, (acc, query, index) => {
				let keys = query.in_keys || query.out_keys(acc[index - 1].nodes);
				return this._bucket.getNodes(keys, options)
					.then((nodes) => {
						// console.log("NODES", index, nodes);
						acc[index] = {
							name: query.name,
							nodes: nodes
						};
						return acc;
					});
			}, [])
			.then((res) => {
				let out = _(res)
					.keyBy('name')
					.mapValues((t, qname) => _(t.nodes)
						.values()
						.filter((v, k) => !_.isUndefined(v))
						.value())
					.value();
				return _.isFunction(q.final) ? q.final(out) : out;
			});
	}

	set(values, options) {
		switch (values.type) {
		case 'insert':
			return this.insert(values, options);
			break;
		case 'replace':
			return this.replace(values, options);
			break;
		case 'counter':
			return this.counterInsert(values, options);
			break;
		case 'upsert':
		default:
			return this.upsert(values, options);
			break;
		}
	}

	counterInsert(values, options) {
		return Promise.each(values.data, (node) => {
			let node_key = node["@id"];
			return this._bucket.counterInsert(`counter-${node_key}`, values.counter_options || {}, node, options[node_key] || {}, values.delimiter);
		});
	}

	replace(values, options) {
		return this._bucket.replaceNodes(values.data, options);
	}

	upsert(values, options) {
		return this._bucket.upsertNodes(values.data, options);
	}

	insert(values, options) {
		return this._bucket.insertNodes(values.data, options);
	}

	//DESTROY
	remove(keys, options) {
		return this._bucket.removeNodes(keys, options);
	}
}

