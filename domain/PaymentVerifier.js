const config = require('../data/config.json');
const sha1 = require('sha1');

class PaymentVerifier {
	constructor(downloadManager, coinSpecificPaymentVerifier) {
		this.downloadManager = downloadManager;
		this.coinSpecificPaymentVerifier = coinSpecificPaymentVerifier;
	}

	async GetDownloadCode(orderID, verificationData) {
		let verificationHash = this.coinSpecificPaymentVerifier.GetVerificationHash(verificationData);
		let downloadCode = this.downloadManager.GetDownloadCodeByHash(verificationHash);

		if (downloadCode) {
			return downloadCode;
		}

		let verificationResult = await this.coinSpecificPaymentVerifier.VerifyPayment(orderID, verificationData);
		if (!verificationResult.Verified) {
			throw 'Payment Verification Failed. '+verificationResult.ReasonForFailure;
		}

		return this.downloadManager.GenerateDownloadCode(orderID, verificationHash);
	}

}

module.exports = PaymentVerifier;
