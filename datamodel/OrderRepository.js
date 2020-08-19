const constants = require('../constants.json');
const config = require('../data/config.json');

class OrderRepository {

	constructor(DBPath, debugLogger) {
		this.db = require('better-sqlite3')(DBPath);
		this.debugLogger = debugLogger;
	}

	GetOrder(orderID) {
		return this.db.prepare('SELECT * FROM Orders WHERE OrderID = :OrderID').get({OrderID: orderID});
	}

	CreateOrder(productID, currency, orderPrice, address) {
		const binds = {
			ProductID: productID,
			Currency: currency,
			Price: orderPrice,
			Address: address
		};

		const info = this.db.prepare('INSERT INTO Orders (ProductID, Currency, Price, Address) VALUES (:ProductID, :Currency, :Price, :Address)').run(binds);
		this.debugLogger.Log(info);

		return {
			OrderID: info.lastInsertRowid,
			ProductID: productID,
			Currency: currency,
			Price: orderPrice,
			Address: address
		};
	}

}

module.exports = OrderRepository;
