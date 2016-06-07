'use strict'
let uuid = require('node-uuid');
let keymakers = require("./keymakers");
let base_dir = "../../../";

let AtomicFactory = require(base_dir + '/build/Classes/Atomic/AtomicFactory');

let TSFactoryDataProvider = require(base_dir + '/build/Classes/Atomic/DataProvider/TSFactoryDataProvider');
let TSIngredientDataProvider = require(base_dir + '/build/Classes/Atomic/DataProvider/TSIngredientDataProvider');
let CouchbirdDataProvider = require(base_dir + '/build/externals/CouchbirdDataProvider');

let RDCacheAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/RDCacheAccessor');
let LDAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/LDAccessor');
let BasicAccessor = require(base_dir + '/build/Classes/Atomic/Accessor/BasicAccessor');

let ContentAsync = require(base_dir + '/build/Classes/ContentAsync');
let ResourceFactoryAsync = require(base_dir + '/build/Classes/ResourceFactoryAsync');

let TypeModel = require(base_dir + '/build/Classes/Atomic/BaseTypes/Ticket');

class IrisBuilder {
	static init(db, cfg) {
		this.default_slot_size = cfg.default_slot_size;
		this.db = db;
	}
	static getResourceSource() {
		let dp = new CouchbirdDataProvider(this.db);

		let ops_resource_accessor = new RDCacheAccessor(dp);
		let ops_accessor = new LDAccessor(dp);
		let services_accessor = new LDAccessor(dp);

		ops_resource_accessor
			.keymaker('get', keymakers('op_resource')
				.get)
			.keymaker('set', keymakers('op_resource')
				.set);
		services_accessor.keymaker('get', keymakers('op_service_plan')
			.get);
		ops_accessor.keymaker('get', keymakers('op_plan')
			.get);


		let plans_datamodel = {
			type: 'FieldsetPlan',
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let ops_datamodel = {
			type: 'FieldsetPlan',
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let services_datamodel = {
			type: {
				type: 'FieldsetPlan',
				deco: 'BaseCollection',
				params: 'service_id'
			},
			deco: 'BaseCollection',
			params: 'operator_id'
		};

		let ops_collection = AtomicFactory.create('BasicAsync', {
			type: ops_datamodel,
			accessor: ops_accessor
		});

		let plan_collection = AtomicFactory.create('BasicAsync', {
			type: plans_datamodel,
			accessor: ops_resource_accessor
		});

		let operator_services_collection = AtomicFactory.create('BasicAsync', {
			type: services_datamodel,
			accessor: services_accessor
		});
		let resource_source = new ContentAsync();

		resource_source.addAtom(plan_collection, 'plan');
		resource_source.addAtom(ops_collection, 'operators');
		resource_source.addAtom(operator_services_collection, 'services', '<namespace>attribute');

		let i_provider = new TSIngredientDataProvider();
		i_provider
			.setIngredient('ldplan', resource_source)
			.setSize(this.default_slot_size);

		return i_provider;
	}

	static getFactory(ingredients, box_storage, order) {
		let dp = new CouchbirdDataProvider(this.db);

		let data_model = {
			type: 'Ticket',
			deco: 'BaseCollection',
			params: 'box_id'
		};

		//setting resource volume
		let factory_provider = new TSFactoryDataProvider();
		_.map(ingredients, (i_provider, key) => {
			factory_provider
				.addIngredient(i_provider.property, i_provider);
		});

		let factory_accessor = new BasicAccessor(factory_provider);
		factory_accessor.keymaker('set', (query) => {
				return {
					selection: {
						ldplan: {
							operator: query.operator || '*',
							service_keys: query.service_keys,
							operator_keys: query.operator_keys,
							organization: query.organization,
							service: '*',
							time_description: query.time_description,
							method: query.method || 'live',
							dedicated_date: query.dedicated_date
						}
					},
					box_id: '*',
					reserve: query.reserve || false,
					count: query.count,
					quota_status: query.quota_status
				};
			})
			.keymaker('get', (query) => {
				return {
					selection: {
						ldplan: {
							operator: query.operator || '*',
							organization: query.organization,
							service: '*',
							service_keys: query.service_keys,
							operator_keys: query.operator_keys,
							time_description: query.time_description,
							service_count: query.service_count,
							method: query.method || 'live',
							dedicated_date: query.dedicated_date
						}
					},
					services: query.services,
					box_id: '*',
					count: query.count,
					existing_only: !!query.existing_only
				};
			});


		let Model = TypeModel;

		factory_provider
			.addStorage(box_storage)
			.addFinalizer((data) => {
				let tickets = _.filter(data, _.isPlainObject);
				let res = _.map(tickets, (t_data) => {
					return Model.buildSerialized(t_data);
				});
				return res;
			})
			.addOrder(order);

		let box_builder = AtomicFactory.create('BasicAsync', {
			type: data_model,
			accessor: factory_accessor
		});

		let factory = new ResourceFactoryAsync();
		factory
			.addAtom(box_builder, 'box', '<namespace>builder')
			.addAtom(box_storage, 'box', '<namespace>content');

		return factory;
	}

}

module.exports = IrisBuilder;