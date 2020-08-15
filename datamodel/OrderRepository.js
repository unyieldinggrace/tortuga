class OrderRepository {

	constructor(DBPath, debugLogger) {
		this.db = require('better-sqlite3')(DBPath);
		this.debugLogger = debugLogger;
	}

	GetOrder(orderID) {
		return this.db.prepare('SELECT * FROM Orders WHERE OrderID = :OrderID').get({OrderID: orderID});
	}

	CreateOrder(productID, currency, orderPrice) {
		const binds = {
			ProductID: productID,
			Currency: currency,
			Price: orderPrice
		};

		const info = this.db.prepare('INSERT INTO Orders (ProductID, Currency, Price) VALUES (:ProductID, :Currency, :Price)').run(binds);
		this.debugLogger.Log(info);

		return {
			OrderID: info.lastInsertRowid,
			ProductID: productID,
			Currency: currency,
			Price: orderPrice
		};
	}

}

module.exports = OrderRepository;
