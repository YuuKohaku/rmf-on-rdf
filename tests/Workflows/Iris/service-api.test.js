'use strict'
let RDFcb = require("cbird-rdf")
	.RD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


describe('Workflow: IRIS Service', () => {
			// describe.only('Workflow: RD IRIS Service', () => {
			let test_data = require(_base + "/tests/data/data_expanded_parsed.json");
			let test_cfg = require(_base + "/tests/data/config.json");
			let test_fields = require(_base + "/tests/data/terminal_fields.json");
			let keymakers = require(_base + "/build/Workflows/Iris/keymakers");
			let cfg = {
				"couchbird": {
					"server_ip": "192.168.1.42",
					"n1ql": "192.168.1.42:8093"
				},
				"buckets": {
					"main": "rdf",
					"auth": "ss",
					"history": "rdf"
				}
			};


			let iris = null;
			let db = null;
			let bucket = null;

			before(() => {
				db = new RDFcb(cfg.couchbird);
				bucket = db.bucket(cfg.buckets.main);
				bucket.N1QL(Couchbird.N1qlQuery.fromString("CREATE PRIMARY INDEX ON " + cfg.buckets.main + ";"))
				bucket.upsertNodes(test_data);
				// bucket.upsert('user_info_fields', test_fields);
				// bucket.upsert('iris_config_service_groups', test_cfg);

				IrisWorkflow.initializer(cfg.buckets.main);
				let ServiceApi = IrisWorkflow.ServiceApi;
				iris = new ServiceApi();
				iris.initContent();
				//@NOTE: building factory
				//@NOTE: prepare variables

			});
	describe('get services', function () {
		this.timeout(10000);
		it('get service group', (done) => {
			return Promise.resolve(true)
				.then(() => {
					return iris.getServiceGroup({
						query: {
							view_name: "base"
						},
						options: {}
					})
				})
				.then((res) => {
					console.log("BY name", require('util')
						.inspect(res, {
							depth: null
						}));
					return iris.getService({
						keys: "service-1",
						options: {}
					});
				})
				.then((res) => {
					console.log("PICKED", require('util')
						.inspect(res, {
							depth: null
						}));
					return iris.getServiceTree({
						keys: ["sg-1", "sg-3"],
						options: {}
					})
				})
				.then((res) => {
					console.log("SERVICE TREE", require('util')
						.inspect(res, {
							depth: null
						}));
					done();
				});
		});

		it('set Service', (done) => {
			return Promise.resolve(true)
				.then((res) => {
					return iris.getEntry(false, {
						keys: "service-4",
						options: {}
					})
				})
				.then((res) => {
					console.log("BYKEY", require('util')
						.inspect(res, {
							depth: null
						}));
					let wp = _.sample(res);
					return iris.setServiceField({
						query: wp
					}, {
						priority: 5
					})
				})
				.then((res) => {
					console.log("SVC SAVED", require('util')
						.inspect(res, {
							depth: null
						}));
					return iris.getService({
						query: {
							priority: 5
						},
						options: {}
					});
				})
				.then((res) => {
					console.log("CHANGEDD PRIORITY", require('util')
						.inspect(res, {
							depth: null
						}));
					done();
				})
		});
	})
	describe('get org', function () {
		this.timeout(10000);
		it('get orgtree', (done) => {
			iris.getOrganizationTree({
					keys: "department-1"
				})
				.then((res) => {
					console.log("ORGTREE", require('util')
						.inspect(res, {
							depth: null
						}));
					done();
				})
				.catch(err => {
					done(err);
				})
		})
		it('get orgchain', (done) => {
			iris.getWorkstationOrganizationChain("pc-1")
				.then((res) => {
					console.log("ORGCHAIN", require('util')
						.inspect(res, {
							depth: null
						}));
					done();
				})
				.catch(err => {
					done(err);
				})
		})
	})
})
