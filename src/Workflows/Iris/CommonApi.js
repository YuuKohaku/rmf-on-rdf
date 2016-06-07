'use strict'

let keymakers = require("./keymakers");
let base_dir = "../../../";
let getModel = require(base_dir + '/build/Classes/Atomic/type-discover.js');

//Atomics
let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');
//DP
let CouchbirdDataProvider = require(base_dir + '/build/externals/CouchbirdDataProvider');
//accessor
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
//parent
let IrisApi = require("./IrisApi");

class CommonApi extends IrisApi {
	constructor({
		startpoint
	} = {}) {
		super();
		this.content = {};
		this.startpoint = startpoint;
		this.models = {};
	}

	getCache(name, params = [], options = {}) {
		let cname = this.getSystemName('cache', name, params);
		let cached = inmemory_cache.get(cname);
		return cached && Promise.resolve(cached) || this.db.get(cname)
			.then((res) => {
				let r = _.get(res, 'value.content', false);
				r && !options.no_memcache && inmemory_cache.set(cname, r);
				return r || {};
			});
	}

	getSystemName(type, name, params = []) {
		return _.join(_.concat([type, _.snakeCase(name)], params), '_');
	}

	setCache(name, params = [], data, options = {}) {
		let cname = this.getSystemName('cache', name, params);

		!options.no_memcache && inmemory_cache.set(cname, data);
		return this.db.upsert(cname, {
			"@id": cname,
			"@category": _.camelCase(name),
			"@type": "Cache",
			"content": data
		}, options);
	}
	getLookup(name, params = []) {
		let cname = this.getSystemName('lookup', name, params);
		let cached = inmemory_cache.get(cname);
		return cached && Promise.resolve(cached) || this.db.get(cname)
			.then((res) => {
				let r = _.get(res, 'value.content', false);
				r && inmemory_cache.set(cname, r);
				return r;
			});
	}

	setLookup(name, params = [], data) {
		let cname = this.getSystemName('lookup', name, params);
		inmemory_cache.set(cname, data);
		return this.db.upsert(cname, {
			"@id": cname,
			"@category": _.camelCase(name),
			"@type": "Lookup",
			"content": data
		});
	}

	getGlobal(name, params = []) {
		let cname = this.getSystemName('global', name, params);
		let cached = inmemory_cache.get(cname);
		return cached && Promise.resolve(cached) || this.db.get(cname)
			.then((res) => {
				let r = _.get(res, 'value.content', false);
				r && inmemory_cache.set(cname, r);
				return r;
			});
	}

	setGlobal(name, params = [], data) {
		let cname = this.getSystemName('global', name, params);
		inmemory_cache.set(cname, data);
		return this.db.upsert(cname, {
			"@id": cname,
			"@category": _.camelCase(name),
			"@type": "Description",
			"content": data
		});
	}

	getRegistry(name, params = []) {
		let cname = this.getSystemName('registry', name, params);
		let cached = inmemory_cache.get(cname);
		return cached && Promise.resolve(cached) || this.db.get(cname)
			.then((res) => {
				let r = _.get(res, 'value.content', false);
				r && inmemory_cache.set(cname, r);
				return r || [];
			});
	}

	setRegistry(name, params = [], data) {
		let cname = this.getSystemName('registry', name, params);
		inmemory_cache.set(cname, data);
		return this.db.upsert(cname, {
			"@id": cname,
			"@content_type": _.upperFirst(_.camelCase(name)),
			"@type": "Registry",
			"content": data
		});
	}

	getEntryTypeless(keys) {
		return this.db.getNodes(_.compact(_.castArray(keys)))
			.then((res) => {
				// console.log("TYPELESS RES", res, keys);
				return _.mapValues(res, (val, key) => {
					let Model = this.models[val.value["@type"]];
					return Model.buildSerialized(val);
				})
			})
			.catch((err) => {
				console.log("TYPELESS GET ERR", keys, err.stack);
				return false;
			});
	}

	setEntryTypeless(data) {
		return Promise.resolve(true)
			.then(() => {
				let data_serialized = _.map(_.castArray(data), (val, key) => {
					let Model = this.models[val.type];
					return Model.buildDbData(val);
				});

				return this.db.upsertNodes(data_serialized);
			})
			.catch((err) => {
				console.log("TYPELESS GET ERR", err.stack);
				return false;
			});
	}

	initContent(ModelName) {
		let dp = new CouchbirdDataProvider(this.db);
		let Model = getModel.dataType(ModelName);
		let snake_model = _.snakeCase(ModelName);
		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic')(Model, snake_model)
				.set)
			.keymaker('get', keymakers('generic')(Model, snake_model)
				.get);


		//@NOTE: actually not content, but atomic
		this.content[ModelName] = storage_accessor;
		this.models[ModelName] = Model;
		return this;
	}

	getContent(ModelName) {
		return this.content[ModelName];
	}

	getEntry(type, query) {
		// console.log("GET", type, query);
		return ((!type || !this.content[type]) && query.keys) ?
			this.getEntryTypeless(query.keys) :
			this.content[type].get(query)
			.then((res) => {
				let Model = this.models[type];
				// console.log("RES", res);
				let transformed = _.reduce(res, (acc, entity, key) => {
					acc[key] = Model.buildSerialized(entity);
					return acc;
				}, {});
				// console.log("RES", transformed);
				return transformed;
			});
	}

	setEntryField(type, query, assignment, concat = true) {
		let t = assignment;
		return this.getEntry(type, query)
			.then(res => {
				// console.log("ENTRY",res);
				let set = _.map(res, entry => {
					return _.mergeWith(entry, t, (objValue, srcValue, key) => {
						if (concat && _.isArray(objValue)) {
							let val = objValue ? _.castArray(objValue) : [];
							return _.uniq(_.concat(val, srcValue));
						} else if (!concat && _.isArray(objValue)) {
							return _.castArray(srcValue);
						}
					});
				});
				return this.setEntry(type, set);
			});
	}

	setEntry(type, data) {
		let content = _.castArray(data);
		let tp = _.compact(_.uniq(_.map(content, "type")));

		return (tp.length > 1 && !type && !this.content[type] && !this.content[tp[0]]) ?
			this.setEntryTypeless(content) :
			this.content[type || tp[0]].set(content);
	}

}

module.exports = CommonApi;