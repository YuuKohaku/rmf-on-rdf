let DataState = {
	IDLE,
	LOADING,
	LOADED,
	BUILDING,
	READY,
	FLUSHING,
	ERRORED
};

class Dataset {
	constructor(accessor) {
		this.accessor = accessor;
		this.resolvers = {};
		this._generatrix = {};

		this.state = DataState.IDLE;
	}

	// methods
	setResolver(rname, rfn) {
		this.resolvers[rname] = rfn;
	}

	load(query) {
		this.state = DataState.LOADING;
		return this.accessor.get(query)
			.then((res) => {
				this.state = DataState.LOADED;
				this._generatrix = res;
				return Promise.resolve(true);
			});
	}

	fire(build_params) {
		_.map(this.resolvers, (resolver, rname) => {

		});
	}


}

module.exports = Dataset;