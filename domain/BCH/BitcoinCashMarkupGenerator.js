const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const QR = require('qrcode-generator');
const config = require('../../data/config.json');
const constants = require('../../constants.json');

class BitcoinCashMarkupGenerator {

	GetCurrency() {
		return constants.COIN_TYPE_BCH;
	}

	GetScriptsSnippet(order, product) {
		let scripts = fs.readFileSync(path.resolve('domain/BCH/bitcoincashcheckoutscripts.mustache')).toString();
		return Mustache.render(scripts, {
			VerifyURL: this.getVerifyURL(order),
			PaymentAddress: order.Address,
			ExpectedAmount: order.Price
		});
	}

	GetPaymentAreaSnippet(order, product) {
		let paymentArea = fs.readFileSync(path.resolve('domain/BCH/bitcoincashpaymentarea.mustache')).toString();
		return Mustache.render(paymentArea, {
			DataURL: this.getQRCodeDataURL(order),
			VerifyURL: this.getVerifyURL(order),
			PaymentSuccessImage: config.baseURL+'/static/base/payment-success.png',
			PaymentAddress: order.Address,
			ExpectedAmount: order.Price
		});
	}

	RoundOffPrice(price) {
		let factor = 10000000;
		return (Math.round(price * factor) / factor);
	}

	getVerifyURL(order) {
		return config.baseURL+'/verify/bitcoin-cash/'+order.OrderID+'?BCHAddress='+order.Address;
	}

	getQRCodeDataURL(order) {
		let typeNumber = 0;
		let errorCorrectionLevel = 'M';
		let qr = QR(typeNumber, errorCorrectionLevel);
		qr.addData(order.Address+'?amount='+order.Price);
		qr.make();

		return qr.createDataURL(4);
	}

}

module.exports = BitcoinCashMarkupGenerator;
