const config = require('../data/config.json');
const fs = require('fs');
const Mustache = require('mustache');
const path = require('path');

class ErrorPageBuilder {
	GetErrorPageMarkup(errorMessage) {
		return Mustache.render(fs.readFileSync(path.resolve('data/pages/error.mustache')).toString(), {
			ErrorMessage: errorMessage,
			BaseURL: config.baseURL
		});
	}
}

module.exports = ErrorPageBuilder;
