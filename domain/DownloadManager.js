const path = require('path');
const RandomStringGenerator = require('./RandomStringGenerator');

class DownloadManager {
	constructor(downloadLog, orderRepository, productRepository, debugLogger) {
		this.downloadLog = downloadLog;
		this.orderRepository = orderRepository;
		this.productRepository = productRepository;
		this.debugLogger = debugLogger;
	}

	GetDownloadCodeByHash(verificationHash) {
		let downloadLogEntry = this.downloadLog.GetDownloadLogEntryByHash(verificationHash);
		if (!downloadLogEntry) {
			return null;
		}

		return downloadLogEntry.DownloadCode;
	}

	GenerateDownloadCode(orderID, verificationHash) {
		let downloadCode = RandomStringGenerator.prototype.generateRandomString(16);
		this.downloadLog.StoreDownloadCode(orderID, verificationHash, downloadCode);

		return downloadCode;
	}

	GetDownloadParametersForDownloadCode(downloadCode) {
		let downloadLogEntry = this.downloadLog.GetDownloadLogEntryByCode(downloadCode);
		if (!downloadLogEntry) {
			throw 'No download found for download code: '+downloadCode;
		}

		let order = this.orderRepository.GetOrder(downloadLogEntry.OrderID);
		let product = this.productRepository.GetProduct(order.ProductID);

		if (downloadLogEntry.NumDownloads >= product.MaxDownloads) {
			throw 'All '+product.MaxDownloads+' downloads of this product have been used.';
		}

		return {
			FilePath: path.resolve('data/downloads/'+product.Path),
			FileName: product.DownloadFileName
		};
	}

	IncrementDownloadCount(downloadCode) {
		this.downloadLog.IncrementDownloadCount(downloadCode);
	}

}

module.exports = DownloadManager;
