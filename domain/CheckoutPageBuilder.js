const config = require('../data/config.json');
const fs = require('fs');
const Mustache = require('mustache');
const path = require('path');

class CheckoutPageBuilder {
	constructor(productRepository, orderRepository, exchangeRateRepository, debugLogger, coinSpecificMarkupGenerator, coinSpecificAddressRepository) {
		this.productRepository = productRepository;
		this.orderRepository = orderRepository;
		this.exchangeRateRepository = exchangeRateRepository;
		this.debugLogger = debugLogger;
		this.coinSpecificMarkupGenerator = coinSpecificMarkupGenerator;
		this.coinSpecificAddressRepository = coinSpecificAddressRepository;
	}

	async GetCheckoutPageMarkup(productShortCode) {
		let product = this.getProduct(productShortCode);
		let order = await this.createOrder(product);

		return Mustache.render(fs.readFileSync(path.resolve('data/pages/checkout.mustache')).toString(), {
			Scripts: this.coinSpecificMarkupGenerator.GetScriptsSnippet(order, product),
			PaymentArea: this.coinSpecificMarkupGenerator.GetPaymentAreaSnippet(order, product),
			ProductTitle: product.Name,
			DisplayPrice: this.getDisplayPrice(product),
			ProductImageURL: config.baseURL+'/static/'+product.ImageURL,
			BaseURL: config.baseURL
		});
	}

	getProduct(productShortCode) {
		let product = this.productRepository.GetProductByShortCode(productShortCode);
		if (!product) {
			throw 'No product found with short-code "'+productShortCode+'".';
		}

		return product;
	}

	async createOrder(product) {
		let paymentCurrency = this.coinSpecificMarkupGenerator.GetCurrency();

		let exchangeRate = await this.exchangeRateRepository.GetExchangeRate(product.Currency, paymentCurrency);
		let orderPrice = this.coinSpecificMarkupGenerator.RoundOffPrice(product.Price / exchangeRate);
		let address = this.coinSpecificAddressRepository.GetNextAddress();

		this.debugLogger.Log({
			'ProductPrice': product.Price,
			'ProductCurrency': product.Currency,
			'ExchangeRate': exchangeRate,
			'OrderPrice': orderPrice,
			'Address': address
		});

		return this.orderRepository.CreateOrder(product.ProductID, this.coinSpecificMarkupGenerator.GetCurrency(), orderPrice, address);
	}

	getDisplayPrice(product) {
		let formatted = (new Intl.NumberFormat('en-US', { style: 'currency', currency: product.Currency })).format(product.Price);
		return formatted+' ('+product.Currency+')';
	}

}

module.exports = CheckoutPageBuilder;
