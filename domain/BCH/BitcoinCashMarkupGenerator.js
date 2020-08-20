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
		let typeNumber = 0;
		let errorCorrectionLevel = 'M';
		let qr = QR(typeNumber, errorCorrectionLevel);
		qr.addData(order.Address+'?amount='+order.Price);
		qr.make();

		let dataURL = qr.createDataURL(4);
		let verifyURL = this.getVerifyURL(order);
		let paymentSuccessImage = config.baseURL+'/static/base/payment-success.png';

		return `<div class="qr-container">
	<div class="qr-image-container">
		<img src="${dataURL}"  alt="Bitcoin Cash QR Code" class="qr-image" />
		<div class="qr-image-overlay"><img src="${paymentSuccessImage}"></div>
	</div>
	<div class="qr-description">Scan here to pay ${order.Price} BCH to ${order.Address}</div>
	<div class="no-autodetect-message">Payment not detected? Click <a href="${verifyURL}">here</a> to manually check.</div>
</div>`;
	}

	RoundOffPrice(price) {
		let factor = 10000000;
		return (Math.round(price * factor) / factor);
	}

	getVerifyURL(order) {
		return config.baseURL+'/verify/bitcoin-cash/'+order.OrderID+'?BCHAddress='+order.Address;
	}

}

module.exports = BitcoinCashMarkupGenerator;
