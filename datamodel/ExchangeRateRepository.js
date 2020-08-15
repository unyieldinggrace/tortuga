const axios = require('axios');

class ExchangeRateRepository {

	constructor(DBPath, debugLogger) {
		this.db = require('better-sqlite3')(DBPath);
		this.debugLogger = debugLogger;
		this.coinGeckoURL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash%2Cbitcoin%2Cmonero%2Cnano&vs_currencies=aud%2Cusd%2Ceur%2Cjpy%2Ckrw%2Cnzd%2Csgd%2Cbrl%2Ccad%2Cgbp%2Ccny';
	}

	async GetExchangeRate(merchantPriceCurrency, customerPaymentCurrency) {
		const binds = {
			MerchantPriceCurrency: merchantPriceCurrency,
			CustomerPaymentCurrency: customerPaymentCurrency
		};

		this.debugLogger.Log('Binds for Retrieving Exchange Rate:');
		this.debugLogger.Log(binds);

		const query = `
SELECT Rate
FROM ExchangeRates
WHERE MerchantPriceCurrency = :MerchantPriceCurrency
	AND CustomerPaymentCurrency = :CustomerPaymentCurrency
	AND Timestamp > datetime('now', '-360 minutes');;
`;

		let stmt = this.db.prepare(query);

		let exchangeRate = stmt.get(binds);
		this.debugLogger.Log(exchangeRate);

		if (!exchangeRate) {
			await this.storeLatestExchangeRates();
			exchangeRate = stmt.get(binds);
		}

		return exchangeRate.Rate;
	}

	async storeLatestExchangeRates() {
		this.debugLogger.Log('Getting exchange data...');
		let exchangeData = await this.getExchangeData();
		this.debugLogger.Log(exchangeData);

		let stmt = this.db.prepare(`
INSERT INTO ExchangeRates (MerchantPriceCurrency, CustomerPaymentCurrency, Rate, Timestamp)
VALUES (:MerchantPriceCurrency, :CustomerPaymentCurrency, :Rate, datetime('now'));
`);

		await this.addExchangeRatesForFiatToCrypto(stmt, exchangeData);
	}

	async addExchangeRatesForFiatToCrypto(stmt, exchangeData) {
		for (const cryptoCurrency of Object.keys(exchangeData)) {
			for (const fiatCurrencyCode of Object.keys(exchangeData[cryptoCurrency])) {
				let bindVariables = {
					MerchantPriceCurrency: fiatCurrencyCode.toUpperCase(),
					CustomerPaymentCurrency: cryptoCurrency,
					Rate: parseFloat(exchangeData[cryptoCurrency][fiatCurrencyCode])
				};

				this.debugLogger.Log('Inserting exchange rate with values: ');
				this.debugLogger.Log(bindVariables);

				stmt.run(bindVariables);
			}
		}
	}

	async getExchangeData() {
		let result = await axios.get(this.coinGeckoURL);
		return result.data;
	}

}

module.exports = ExchangeRateRepository;
