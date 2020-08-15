const sha1 = require('sha1');
const axios = require('axios');
const config = require('../../data/config.json');

class BrainBlocksPaymentVerifier {

	constructor(orderRepository, debugLogger) {
		this.orderRepository = orderRepository;
		this.debugLogger = debugLogger;
	}

	GetVerificationHash(verificationData) {
		return sha1(verificationData.token);
	}

	async VerifyPayment(orderID, verificationData) {
		let order = this.orderRepository.GetOrder(orderID);
		if (!order) {
			throw 'No order found with ID "'+orderID+'".';
		}

		let reasonForFailure = await this.verifyBrainBlocksPayment(order, verificationData.token);
		if (reasonForFailure) {
			return {
				Verified: false,
				ReasonForFailure: reasonForFailure
			};
		}

		return {
			Verified: true,
			ReasonForFailure: null
		};
	}

	async verifyBrainBlocksPayment(order, brainBlocksToken) {
		const verificationResponse = await axios.get('https://api.brainblocks.io/api/session/'+brainBlocksToken+'/verify');
		const brainBlocksResponse = verificationResponse.data;

		this.debugLogger.Log(brainBlocksResponse);

		let orderPriceRai = Math.round(order.Price * 1000000);
		if (orderPriceRai !== brainBlocksResponse.amount_rai) {
			return 'Amount of payment ('+brainBlocksResponse.amount_rai+') does not match expected price ('+orderPriceRai+')';
		}

		if (config.NanoAddress !== brainBlocksResponse.destination) {
			return 'Paid to incorrect address ('+brainBlocksResponse.destination+') instead of expected address ('+config.NanoAddress+')';
		}

		if (!brainBlocksResponse.fulfilled) {
			return 'Payment not fulfilled.';
		}

		return null;
	}

}

module.exports = BrainBlocksPaymentVerifier;
