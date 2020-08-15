const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const config = require('../../data/config.json');
const constants = require('../../constants.json');

class BrainBlocksMarkupGenerator {

	GetCurrency() {
		return constants.COIN_TYPE_NANO;
	}

	GetScriptsSnippet(order, product) {
		let scripts = fs.readFileSync(path.resolve('domain/NANO/nanocheckoutscripts.html')).toString();
		return Mustache.render(scripts, {
			NanoAddress: config.NanoAddress,
			RaiAmount: Math.round(order.Price * 1000000),
			SuccessURL: config.baseURL+'/verify/nano/'+order.OrderID,
		});
	}

	GetPaymentAreaSnippet() {
		return '<div id="nano-button"></div>';
	}

}

module.exports = BrainBlocksMarkupGenerator;
