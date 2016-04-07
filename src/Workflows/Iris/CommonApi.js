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
	}

	getCache(name, params = []) {
		let cname = this.getSystemName('cache', name, params);
		return this.db.get(cname)
			.then((res) => res.value.content)
			.catch((err) => ({}));
	}

	getSystemName(type, name, params = []) {
		return _.join(_.concat([type, _.snakeCase(name)], params), '_');
	}

	setCache(name, params = [], data) {
		let cname = this.getSystemName('cache', name, params);
		return this.db.upsert(cname, {
			"@id": cname,
			"@category": _.camelCase(name),
			"@type": "Cache",
			"content": data
		});
	}
	getLookup(name, params = []) {
		let cname = this.getSystemName('lookup', name, params);
		return this.db.get(cname)
			.then((res) => res.value.content)
			.catch((err) => {});
	}

	setLookup(name, params = [], data) {
		let cname = this.getSystemName('lookup', name, params);
		return this.db.upsert(cname, {
			"@id": cname,
			"@category": _.camelCase(name),
			"@type": "Lookup",
			"content": data
		});
	}

	getGlobal(name, params = []) {
		let cname = this.getSystemName('global', name, params);
		return this.db.get(cname)
			.then((res) => res.value.content)
			.catch((err) => {});
	}

	setGlobal(name, params = [], data) {
		let cname = this.getSystemName('global', name, params);
		return this.db.upsert(cname, {
			"@id": cname,
			"@category": _.camelCase(name),
			"@type": "Description",
			"content": data
		});
	}

	getEntryTypeless(keys) {
		return this.db.getNodes(_.compact(_.castArray(keys)))
			.then((res) => {
				// console.log("TYPELESS RES", res);
				return _.mapValues(res, (val, key) => {
					let Model = this.models[val.value["@type"]];
					let item = new Model();
					item.build(val);
					return item.serialize();
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
					let item = new Model();
					item.build(val);
					return item.dbSerialize();
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
		let storage_data_model = {
			type: {
				type: ModelName,
				deco: 'RawEntity'
			},
			deco: 'BaseCollection',
			params: 'id'
		};

		let Model = getModel.dataType(storage_data_model.type);
		let snake_model = _.snakeCase(ModelName);
		let storage_accessor = new LDAccessor(dp);

		storage_accessor
			.keymaker('set', keymakers('generic')(Model, snake_model)
				.set)
			.keymaker('get', keymakers('generic')(Model, snake_model)
				.get);


		let storage = AtomicFactory.create('BasicAsync', {
			type: storage_data_model,
			accessor: storage_accessor
		});
		//@NOTE: actually not content, but atomic
		this.content[ModelName] = storage;
		this.models = _.reduce(this.content, (acc, val, key) => {
			acc[key] = getModel.dataType(val.model_decription.type);
			return acc;
		}, {});
		return this;
	}

	getContent(ModelName) {
		return this.content[ModelName];
	}

	getEntry(type, query) {
		// console.log("GET", type, query, this.models);
		return ((!type || !this.content[type]) && query.keys) ?
			this.getEntryTypeless(query.keys) :
			this.content[type].resolve(query)
			.then((res) => {
				// console.log("RES", res);
				return res.serialize();
			});
	}

	setEntryField(type, query, assignment, concat = true) {
		let t = assignment;
		return this.getEntry(type, query)
			.then(res => {
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
			this.content[type || tp[0]].save(content);
	}

}

module.exports = CommonApi;
