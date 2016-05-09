'use strict'

var Path = require('./Path/Path.js');
var ResolvedContent = require('./ResolvedContent');

//@NOTE: may be ResolvedContent and Content should have common parent class
//@NOTE: something like AbcstractContent
//@NOTE: this will separated methods linked to content_map

class ResolvedContentAsync extends ResolvedContent {
	constructor(parent) {
		super(parent);
	}

	save() {
		//@NOTE : bullshit below
		var path = this.selector()
			.traverse();
		var atom_data;
		var result = [];

		for (atom_data of path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;

			let status = this.parent.getAtom(atom_path)
				.save(atom, true);

			result.push(status);
		}
		return Promise.all(result);
	}

	observe(query) {
		let atom_data;
		let observed_atoms = [];
		for (atom_data of this.path) {
			let {
				atom_path: atom_path,
				atom: atom
			} = atom_data;
			let params = query || this.path.getQueryParams() || {};
			let observed_atom = {
				atom_path: _.clone(atom_path),
				atom: atom.observe(params)
			};

			observed_atoms.push(Promise.resolve(observed_atom));
		}

		return Promise.all(observed_atoms)
			.then((res) => {
				_.map(res, ({
					atom_path,
					atom
				}) => {
					this.addAtom(atom_path, atom);
				});
				return this;
			});
	}
	reserve(query) {
		var atom_data;

		for (atom_data of this.path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;
			var params = query || this.path.getQueryParams() || {};

			var after_reserve = atom.reserve(params);

			if (after_reserve) this.addAtom(atom_path, after_reserve);
		}

		return this;
	}

}

module.exports = ResolvedContentAsync;