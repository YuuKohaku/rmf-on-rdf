module.exports = {
	initializer: require("./IrisApi").init,
	BookingApi: require("./BookingApi"),
	UserInfoApi: require("./UserInfoApi"),
	TicketApi: require("./TicketApi"),
	EmployeeApi: require("./EmployeeApi"),
	WorkplaceApi: require("./WorkplaceApi"),
	HistoryApi: require("./HistoryApi")
};