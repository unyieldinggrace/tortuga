class DownloadLog {
	constructor(DBPath) {
		this.db = require('better-sqlite3')(DBPath);
	}

	GetDownloadLogEntryByHash(verificationHash) {
		let binds = {
			VerificationHash: verificationHash
		};

		return this.db.prepare('SELECT * FROM DownloadLog WHERE VerificationHash = :VerificationHash').get(binds);
	}

	StoreDownloadCode(orderID, verificationHash, downloadCode) {
		let binds = {
			OrderID: orderID,
			VerificationHash: verificationHash,
			DownloadCode: downloadCode
		};

		let sql = `
INSERT INTO DownloadLog (OrderID, VerificationHash, NumDownloads, DownloadCode)
	VALUES (:OrderID, :VerificationHash, 0, :DownloadCode);
`;

		this.db.prepare(sql).run(binds);
	}

	GetDownloadLogEntryByCode(downloadCode) {
		let binds = {
			DownloadCode: downloadCode
		};

		return this.db.prepare('SELECT * FROM DownloadLog WHERE DownloadCode = :DownloadCode').get(binds);
	}

	IncrementDownloadCount(downloadCode) {
		let binds = {
			DownloadCode: downloadCode
		};

		let sql = 'UPDATE DownloadLog SET NumDownloads = NumDownloads + 1 WHERE DownloadCode = :DownloadCode';
		this.db.prepare(sql).run(binds);
	}
}

module.exports = DownloadLog;
