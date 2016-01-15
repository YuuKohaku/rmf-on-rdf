'use strict'
module.exports = {
	get: ({
		query: p,
		keys: ids
	}) => {
		if(ids)
			return {
				keys: ids
			};
		let query = {
			type: 'view',
			query: {
				employees: {
					select: "@id",
					where: p
				}
			},
			final: (query) => {
				return query.employees;
			}
		};

		return {
			query: query
		};
	},
	set: (data) => {
		let opts = {};
		let access = _.map(data, (item) => {
			let employee = item;
			delete employee.cas;
			return employee;
		});
		return {
			values: access,
			options: opts
		};
	}
};