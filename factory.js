const config = require('./data/config.json');
const constants = require('./constants.json');
const path = require('path');

const DebugLogger = require('./util/DebugLogger');

const ProductRepository = require('./datamodel/ProductRepository');
const OrderRepository = require('./datamodel/OrderRepository');
const DownloadLog = require('./datamodel/DownloadLog');
const ExchangeRateRepository = require('./datamodel/ExchangeRateRepository');

const CheckoutPageBuilder = require('./domain/CheckoutPageBuilder');
const DownloadPageBuilder = require('./domain/DownloadPageBuilder');
const ErrorPageBuilder = require('./domain/ErrorPageBuilder');
const PaymentVerifier = require('./domain/PaymentVerifier');
const DownloadManager = require('./domain/DownloadManager');

const BrainBlocksMarkupGenerator = require('./domain/NANO/BrainBlocksMarkupGenerator');
const BrainBlocksPaymentVerifier = require('./domain/NANO/BrainBlocksPaymentVerifier');

class Factory {
	GetDebugLogger() {
		if (!this.debugLogger) {
			this.debugLogger = new DebugLogger();
		}

		return this.debugLogger;
	}

	GetProductRepository() {
		if (!this.productRepository) {
			this.productRepository = new ProductRepository(path.resolve(config.DBPath), this.GetDebugLogger());
		}

		return this.productRepository;
	}

	GetOrderRepository() {
		if (!this.orderRepository) {
			this.orderRepository = new OrderRepository(path.resolve(config.DBPath), this.GetDebugLogger());
		}

		return this.orderRepository;
	}

	GetDownloadLog() {
		if (!this.downloadLog) {
			this.downloadLog = new DownloadLog(path.resolve(config.DBPath));
		}

		return this.downloadLog;
	}

	GetExchangeRateRepository() {
		if (!this.exchangeRateRepository) {
			this.exchangeRateRepository = new ExchangeRateRepository(path.resolve(config.DBPath), this.GetDebugLogger());
		}

		return this.exchangeRateRepository;
	}

	GetCheckoutPageBuilder(coinType) {
		let coinSpecificMarkupGenerator;
		switch (coinType) {
			case constants.COIN_TYPE_NANO:
				coinSpecificMarkupGenerator = this.GetNanoCheckoutMarkupGenerator();
				break;
			default:
				throw 'Coin type "' + coinType + '" not recognised.';
		}

		if (!this.checkoutPageBuilder) {
			this.checkoutPageBuilder = new CheckoutPageBuilder(
				this.GetProductRepository(),
				this.GetOrderRepository(),
				this.GetExchangeRateRepository(),
				this.GetDebugLogger(),
				coinSpecificMarkupGenerator
			);
		}

		return this.checkoutPageBuilder;
	}

	GetDownloadPageBuilder() {
		if (!this.downloadPageBuilder) {
			this.downloadPageBuilder = new DownloadPageBuilder(this.GetProductRepository(), this.GetOrderRepository(), this.GetDownloadLog(), this.GetDebugLogger());
		}

		return this.downloadPageBuilder;
	}

	GetErrorPageBuilder() {
		if (!this.errorPageBuilder) {
			this.errorPageBuilder = new ErrorPageBuilder();
		}

		return this.errorPageBuilder;
	}

	GetNanoCheckoutMarkupGenerator() {
		if (!this.brainBlocksMarkupGenerator) {
			this.brainBlocksMarkupGenerator = new BrainBlocksMarkupGenerator();
		}

		return this.brainBlocksMarkupGenerator;
	}

	GetPaymentVerifier(coinType) {
		let coinSpecificPaymentVerifier;
		switch (coinType) {
			case constants.COIN_TYPE_NANO:
				coinSpecificPaymentVerifier = this.GetBrainBlocksPaymentVerifier();
				break;
			default:
				throw 'Coin type "' + coinType + '" not recognised.';
		}

		if (!this.paymentVerifier) {
			this.paymentVerifier = new PaymentVerifier(this.GetDownloadManager(), coinSpecificPaymentVerifier);
		}

		return this.paymentVerifier;
	}

	GetBrainBlocksPaymentVerifier() {
		if (!this.brainBlocksPaymentVerifier) {
			this.brainBlocksPaymentVerifier = new BrainBlocksPaymentVerifier(this.GetOrderRepository(), this.GetDebugLogger());
		}

		return this.brainBlocksPaymentVerifier;
	}

	GetDownloadManager() {
		if (!this.downloadManager) {
			this.downloadManager = new DownloadManager(this.GetDownloadLog(), this.GetOrderRepository(), this.GetProductRepository(), this.GetDebugLogger());
		}

		return this.downloadManager;
	}

}

module.exports = Factory;
