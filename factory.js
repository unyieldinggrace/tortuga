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
const NanoAddressRepository = require("./domain/NANO/NanoAddressRepository");

const BITBOXSDK = require('bitbox-sdk').BITBOX;
const BitcoinCashAddressRepository = require("./domain/BCH/BitcoinCashAddressRepository");
const BitcoinCashPaymentVerifier = require("./domain/BCH/BitcoinCashPaymentVerifier");
const BitcoinCashMarkupGenerator = require("./domain/BCH/BitcoinCashMarkupGenerator");

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
		let coinSpecificAddressRepository;

		switch (coinType) {
			case constants.COIN_TYPE_NANO:
				coinSpecificMarkupGenerator = this.GetNanoCheckoutMarkupGenerator();
				coinSpecificAddressRepository = this.GetNanoAddressRepository();
				break;
			case constants.COIN_TYPE_BCH:
				coinSpecificMarkupGenerator = this.GetBitcoinCashCheckoutMarkupGenerator();
				coinSpecificAddressRepository = this.GetBitcoinCashAddressRepository();
				break;
			default:
				throw 'Coin type "' + coinType + '" not recognised.';
		}

		if (!this.checkoutPageBuilder) {
			this.checkoutPageBuilder = {};
		}

		if (!this.checkoutPageBuilder[coinType]) {
			this.checkoutPageBuilder[coinType] = new CheckoutPageBuilder(
				this.GetProductRepository(),
				this.GetOrderRepository(),
				this.GetExchangeRateRepository(),
				this.GetDebugLogger(),
				coinSpecificMarkupGenerator,
				coinSpecificAddressRepository
			);
		}

		return this.checkoutPageBuilder[coinType];
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

	GetNanoAddressRepository() {
		if (!this.nanoAddressRepository) {
			this.nanoAddressRepository = new NanoAddressRepository();
		}

		return this.nanoAddressRepository;
	}

	GetPaymentVerifier(coinType) {
		let coinSpecificPaymentVerifier;
		switch (coinType) {
			case constants.COIN_TYPE_NANO:
				coinSpecificPaymentVerifier = this.GetBrainBlocksPaymentVerifier();
				break;
			case constants.COIN_TYPE_BCH:
				coinSpecificPaymentVerifier = this.GetBitcoinCashPaymentVerifier();
				break;
			default:
				throw 'Coin type "' + coinType + '" not recognised.';
		}

		if (!this.paymentVerifier) {
			this.paymentVerifier = {};
		}

		if (!this.paymentVerifier[coinType]) {
			this.paymentVerifier[coinType] = new PaymentVerifier(this.GetDownloadManager(), coinSpecificPaymentVerifier);
		}

		return this.paymentVerifier[coinType];
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

	GetBitcoinCashPaymentVerifier() {
		if (!this.bitcoinCashPaymentVerifier) {
			this.bitcoinCashPaymentVerifier = new BitcoinCashPaymentVerifier(this.GetOrderRepository(), this.GetDebugLogger());
		}

		return this.bitcoinCashPaymentVerifier;
	}

	GetBitcoinCashAddressRepository() {
		if (!this.bitcoinCashAddressRepository) {
			this.bitcoinCashAddressRepository = new BitcoinCashAddressRepository(path.resolve(config.DBPath), this.GetDebugLogger(), this.GetBITBOX());
		}

		return this.bitcoinCashAddressRepository;
	}

	GetBitcoinCashCheckoutMarkupGenerator() {
		if (!this.bitcoinCashCheckoutMarkupGenerator) {
			this.bitcoinCashCheckoutMarkupGenerator = new BitcoinCashMarkupGenerator();
		}

		return this.bitcoinCashCheckoutMarkupGenerator;
	}

	GetBITBOX() {
		if (!this.BITBOX) {
			this.BITBOX = new BITBOXSDK({ restURL: `https://rest.bitcoin.com/v2/` });
		}

		return this.BITBOX;
	}

}

module.exports = Factory;
