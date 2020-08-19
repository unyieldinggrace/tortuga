const config = require('../../data/config.json');
const constants = require('../../constants.json');

class BitcoinCashAddressRepository {

	constructor(DBPath, debugLogger, BITBOX) {
		this.db = require('better-sqlite3')(DBPath);
		this.debugLogger = debugLogger;
		this.BITBOX = BITBOX;
	}

	GetNextAddress() {
		const getNext = this.db.prepare('SELECT (LastIndex + 1) NextIndex FROM AddressTracker WHERE CoinType = :BCH');
		const setLast = this.db.prepare('UPDATE AddressTracker SET LastIndex = :Index WHERE CoinType = :BCH');
		const insert = this.db.prepare('INSERT INTO AddressTracker (CoinType, LastIndex) VALUES (:BCH, 0)');

		let nextAddress;

		const getNextAndSetLast = this.db.transaction(() => {
			let result = getNext.get({
				BCH: constants.COIN_TYPE_BCH
			});

			if (!result) {
				result = {NextIndex: 0};
				insert.run({BCH: constants.COIN_TYPE_BCH});
			} else {
				setLast.run({
					BCH: constants.COIN_TYPE_BCH,
					Index: result.NextIndex
				});
			}

			nextAddress = this.BITBOX.Address.fromXPub(config.BCHXPubAddress, '0/'+result.NextIndex);
		});

		getNextAndSetLast();
		return nextAddress;
	}

}

module.exports = BitcoinCashAddressRepository;
