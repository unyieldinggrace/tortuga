const config = require('../data/config.json');
const fs = require('fs');
const Mustache = require('mustache');
const path = require('path');

class CheckoutPageBuilder {
	constructor(productRepository, orderRepository, exchangeRateRepository, debugLogger, coinSpecificMarkupGenerator) {
		this.productRepository = productRepository;
		this.orderRepository = orderRepository;
		this.exchangeRateRepository = exchangeRateRepository;
		this.debugLogger = debugLogger;
		this.coinSpecificMarkupGenerator = coinSpecificMarkupGenerator;
	}

	async GetCheckoutPageMarkup(productShortCode) {
		let product = this.getProduct(productShortCode);
		let order = await this.createOrder(product);

		return Mustache.render(fs.readFileSync(path.resolve('data/pages/checkout.html')).toString(), {
			Scripts: this.coinSpecificMarkupGenerator.GetScriptsSnippet(order, product),
			PaymentArea: this.coinSpecificMarkupGenerator.GetPaymentAreaSnippet(),
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
		let orderPrice = product.Price / exchangeRate;

		this.debugLogger.Log({
			'ProductPrice': product.Price,
			'ProductCurrency': product.Currency,
			'ExchangeRate': exchangeRate,
			'OrderPrice': orderPrice
		});

		return this.orderRepository.CreateOrder(product.ProductID, this.coinSpecificMarkupGenerator.GetCurrency(), orderPrice);
	}

	getDisplayPrice(product) {
		let formatted = (new Intl.NumberFormat('en-US', { style: 'currency', currency: product.Currency })).format(product.Price);
		return formatted+' ('+product.Currency+')';
	}

}

module.exports = CheckoutPageBuilder;
