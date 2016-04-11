'use strict'
module.exports = {
	get: ({
		query: p,
		select = '*',
		keys
	}) => {
		if (keys && !p)
			return {
				keys
			};
		if (!p && !select)
			return {};
		if (!select) {
			_.unset(p, "@id");
		}
		let where = "WHERE " + _.join(_.map(p, (val, key) => {
			if (_.startsWith(key, "@"))
				return `\`${key}\`="${val}"`;
			if (_.isPlainObject(val))
				return "TRUE";
			if (_.isArray(val)) {
				let complex_val = _.join(_.map(val, (v) => {
					let pass = !_.isString(v) ? v : `"${v}"`;
					return `(${pass} IN \`${key}\` OR  \`${key}\`=${pass})`;
				}), " OR ");
				return `(${complex_val})`;
			} else {
				let pass = !_.isString(val) ? val : `"${val}"`;
				return `(${pass} IN \`${key}\` OR  \`${key}\`=${pass})`;
			}
		}), " AND ");
		// console.log(where);
		select = _.startsWith(select, "@") ? `\`${select}\`` : select;
		let query = {
			type: 'n1ql',
			forward: true,
			query: {
				ids: {
					select,
					where
				}
			},
			final: (query) => {
				// console.log("FINKEYS", _.keyBy(query.ids, "@id"));
				return (select == '*') ? _.keyBy(query.ids, "@id") : _.map(query.ids, select);
			}
		};
		console.log("QQ ЗЗ", require('util')
			.inspect(query, {
				depth: null
			}));
		return {
			query
		};
	},
	set: (data) => {
		let access = _.map(data, (item) => {
			let entity = item;
			_.unset(entity, 'cas');
			return entity;
		});

		return {
			data: access
		};
	}
};
