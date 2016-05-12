'use strict'
let RDFcb = require("cbird-rdf").RD;
let Couchbird = require("couchbird");

let IrisWorkflow = require(_base + '/build/Workflows/Iris');
let gpc = require('generate-pincode');


describe('Workflow:RD IRIS Workstation', () => {
	// describe.only('Workflow:RD IRIS Workstation', () => {
	let cfg = {
		"couchbird": {
			"server_ip": "127.0.0.1",
			"n1ql": "127.0.0.1:8093"
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
	});


	describe('get/set wp', function() {
		this.timeout(10000);
		it('get Workstation', () => {

		});

		it('set Workstation', () => {

		})
	})
})