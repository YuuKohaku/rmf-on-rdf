'use strict'

var discover = {
	dataType: function(data) {
		if(_.isString(data)) {
			var fullpath = `./BaseTypes/${data}.js`;

			return require(fullpath);
		}

		if(_.isArray(data)) {
			return _.map(data, (type) => this.dataType(type));
		}

		if(_.isObject(data)) {
			var decorator = data.deco;
			var type = data.type;
			var params = data.params;
			var TypeModel = this.dataType(type);
			var DecoModel = this.dataType(decorator);
			return DecoModel.bind(DecoModel, TypeModel, params);
		}

	},
	atomic: function(data) {
		var fullpath = `./Atomic${_.upperFirst(data)}.js`;

		return require(fullpath);
	}
};

module.exports = discover;