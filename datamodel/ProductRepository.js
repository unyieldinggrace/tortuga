class ProductRepository {

	constructor(DBPath, debugLogger) {
		this.db = require('better-sqlite3')(DBPath);
		this.debugLogger = debugLogger;
	}

	GetProduct(productID) {
		const binds = {
			ProductID: productID
		};

		const product = this.db.prepare('SELECT * FROM products WHERE productid = :ProductID').get(binds);
		this.debugLogger.Log(product);

		return product;
	}

	GetProductByShortCode(productShortCode) {
		const binds = {
			ProductShortCode: productShortCode
		};

		const product = this.db.prepare('SELECT * FROM products WHERE productshortcode = :ProductShortCode').get(binds);
		this.debugLogger.Log(product);

		return product;
	}

}

module.exports = ProductRepository;