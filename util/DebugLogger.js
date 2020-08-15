const config = require('../data/config.json');

class DebugLogger {

	Log(data) {
		if (!config.ShowDebugOutput) {
			return;
		}

		console.log(data);
	}

}

module.exports = DebugLogger;
