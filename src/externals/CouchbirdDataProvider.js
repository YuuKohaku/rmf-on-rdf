'use strict'

let AbstractDataProvider = require('./AbstractDataProvider.js');

class CouchbirdDataProvider extends AbstractDataProvider {
	constructor(bucket) {
		super();
		this._bucket = bucket;
	}

	get({
		keys,
		query,
		options
	}) {
		// console.log("CBLDP GET", keys, query, options);
		if (query) {
			switch (query.type) {
			case 'n1ql':
				return this.process_query(query, options);
				break;
			case 'chain':
				return this.process_chain(query, options);
				break;
			default:
				return {};
				break;
			}
		}
		return this._bucket.getNodes(keys, options);
	}

	getNodes(compound_key, options) {
		let p = {};
		let flatten = (obj) => {
			if (_.isArray(obj) || _.isString(obj)) {
				return this._bucket.getNodes(obj, options);
			} else {
				return Promise.props(_.reduce(obj, (acc, val, k) => {
					acc[k] = flatten(val);
					return acc;
				}, {}));
			}
		};

		let k = compound_key.templates ? compound_key.keys : compound_key;
		p = flatten(k);

		// console.log("CMP", compound_key, k);
		return compound_key.templates ? Promise.props({
			keys: p,
			templates: compound_key.templates
		}) : p;
	}

	process_chain(q, options) {
		let transactional = {};
		return Promise.reduce(q.query, (acc, query, index) => {
				transactional[query.name] = !!query.transactional;
				let keys = query.in_keys || query.out_keys(acc[index - 1].nodes);
				let cached = transactional[query.name] && inmemory_cache.mget(keys) || {};
				let [nonex_keys, ex_keys] = _.partition(keys, k => (_.isUndefined(cached[k]) || !!cached[k].error));
				// console.log("CACHE", _.size(ex_keys), "\nUNDEFINED ", _.size(nonex_keys), "\n\n______________________________________________________________________");
				return this._bucket.getNodes(nonex_keys, options)
					.then((nodes) => {
						// console.log("NODES", index, nodes);
						acc[index] = {
							name: query.name,
							nodes: _.merge(cached, nodes)
						};
						return acc;
					});
			}, [])
			.then((res) => {
				let out = _(res)
					.keyBy('name')
					.mapValues((t, qname) => _(t.nodes)
						.values()
						.filter((v, k) => {
							let t = _.get(v, 'value.@id');
							if (t && transactional[qname]) {
								inmemory_cache.set(t, v);
							}
							return !_.isUndefined(v);
						})
						.value())
					.value();
				return _.isFunction(q.final) ? q.final(out) : out;
			});
	}

	process_query(q, options) {
		let promises = _.mapValues(q.query, (query, qkey) => {
			let params = query.params || [];
			if (query.direct)
				return this._bucket.N1ql.direct({
					query: query.direct,
					params
				});
			let select = query.select || '*';
			let where = query.where || '';
			return this._bucket.N1ql.query({
				select,
				query: where,
				params
			});
		});

		return Promise.props(promises)
			.then((res) => {
				let fin_keys = _.isFunction(q.final) ? q.final(res) : res;
				return q.forward ? fin_keys : this.getNodes(fin_keys, options);
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

module.exports = CouchbirdDataProvider;