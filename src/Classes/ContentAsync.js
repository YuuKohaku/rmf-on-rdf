'use strict'


var ResolvedContentAsync = require('./ResolvedContentAsync.js');
var Content = require('./Content.js');
var Path = require('./Path/Path.js');

class ContentAsync extends Content {
	constructor(Resolved_Model = ResolvedContentAsync) {
		super(Resolved_Model);
	}

	//@NOTE: semantics of this method changed
	resolve(query) {
		let Resolved_Model = this.Resolved_Model;
		let resolved = new Resolved_Model(this);

		let resolved_atoms = [];
		for (let atom_data of this.path) {
			var {
				atom_path: atom_path,
				atom: atom
			} = atom_data;
			//@NOTE: params should be specific for each branch of selection
			let params = query || this.path.getQueryParams() || {};
			this.path.query(params);
			//@TODO: so dirty again, you shouldn't attach property this way. Never!
			resolved.resolve_params = params;
			//@TODO even more dirty with all of those promises
			let resolve_atom = {
				atom_path: Promise.resolve(_.clone(atom_path)),
				atom: atom.resolve(params)
			};

			resolved_atoms.push(Promise.props(resolve_atom));
		}
		return Promise.all(resolved_atoms)
			.then((res) => {
				_.map(res, ({
					atom_path,
					atom
				}) => {
					resolved.addAtom(atom_path, atom);
				});
				return resolved;
			});
	}
	save(data) {
		return Promise.all(_.map(data, (item, index) => {
			if (_.isEmpty(item)) return true;

			var {
				content: content,
				path: path
			} = item;
			if (!path || !content) return false;

			var atom = this.getAtom(path);
			return content instanceof atom.Model ? atom.save(content) : false;
		}));
	}
}

module.exports = ContentAsync;