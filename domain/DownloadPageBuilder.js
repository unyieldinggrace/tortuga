const config = require('../data/config.json');
const fs = require('fs');
const Mustache = require('mustache');
const path = require('path');

class DownloadPageBuilder {
	constructor(productRepository, orderRepository, downloadLog, debugLogger) {
		this.productRepository = productRepository;
		this.orderRepository = orderRepository;
		this.downloadLog = downloadLog;
		this.debugLogger = debugLogger;
	}

	GetDownloadPageMarkup(downloadCode) {
		let downloadLogEntry = this.downloadLog.GetDownloadLogEntryByCode(downloadCode);
		let order = this.orderRepository.GetOrder(downloadLogEntry.OrderID);
		let product = this.productRepository.GetProduct(order.ProductID);

		return Mustache.render(fs.readFileSync(path.resolve('data/pages/download.html')).toString(), {
			ProductTitle: product.Name,
			ProductImageURL: config.baseURL+'/static/'+product.ImageURL,
			DownloadURL: config.baseURL+'/download/'+downloadCode,
			DownloadFileName: product.DownloadFileName,
			DownloadsRemaining: (product.MaxDownloads - downloadLogEntry.NumDownloads),
			BaseURL: config.baseURL
		});
	}

}

module.exports = DownloadPageBuilder;
