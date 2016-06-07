'use strict'

var Document = require('./Document.js');
let RDFcb = require("cbird-rdf")
	.RD;
let Couchbird = require("couchbird");


describe.only('DAO Document', () => {
	let cfg = {
		"couchbird": {
			"server_ip": "194.226.171.100",
			"n1ql": "194.226.171.100:8093"
		},
		"buckets": {
			"main": "rdf",
			"auth": "ss",
			"history": "rdf"
		}
	};


	let db = null;
	let bucket = null;
	let doc;

	before(() => {
		db = new RDFcb(cfg.couchbird);
		bucket = db.bucket(cfg.buckets.main);
	});

	beforeEach(() => {
		doc = new Document(bucket);
	});


	it('#constructor', () => {
		expect(doc)
			.to.be.an.instanceof(Document);
	});

	describe('methods', () => {
		describe('#buildFromId', () => {
			it('get existent', (done) => {
				return doc.buildFromId('pc-buzuluk-1')
					.then((result) => {
						expect(result.system_fields.id)
							.to.equal('pc-buzuluk-1');
						expect(result.system_fields.type)
							.to.equal('Workstation');
						done();
					})
					.catch((err) => {
						done(err);
					});
			})
			it('nonexistent', (done) => {
				return doc.buildFromId('something-definitely-nonexistent')
					.then((result) => {
						done(new Error('Should not exist!'));
					})
					.catch((err) => {
						if (err.message == 'Failed to find specified document: something-definitely-nonexistent')
							done();
						else
							done(err);
					});
			});
		});

		describe('#save', () => {
			it('save existent', (done) => {
				return doc.buildFromId('pc-buzuluk-1')
					.then((result) => {
						doc.setField(label, 'Window 1');
						return doc.save();
					})
			});

			it('nonexistent - returns "false"', () => {
				var status = hash.set('foobar');
				expect(status)
					.to.not.be.ok;
			});
		});

		describe('#upsert', () => {
			it('upsert anything', () => {
				var result = hash.upsert('bar', 'baz');
				expect(result)
					.to.be.ok;

				result = hash.get('bar');
				expect(result)
					.to.equal('baz');
			});

		});
	});
});