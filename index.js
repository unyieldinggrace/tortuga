const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const Factory = require('./factory');
const factory = new Factory();

app.use('/static', express.static(path.join(__dirname, 'data/static')));

const sendErrorPageOnCatch = (res, e) => {
	let errorPageBuilder = factory.GetErrorPageBuilder();
	res.send(errorPageBuilder.GetErrorPageMarkup(e));
};

app.get('/checkout/:cointype/:productshortcode', async (req, res) => {
	let checkoutPageBuilder;
	try {
		checkoutPageBuilder = factory.GetCheckoutPageBuilder(req.params.cointype);
	} catch (e) {
		sendErrorPageOnCatch(res, e);
		return;
	}

	try {
		res.send(await checkoutPageBuilder.GetCheckoutPageMarkup(req.params.productshortcode));
	} catch (e) {
		sendErrorPageOnCatch(res, e);
	}
});

app.get('/verify/:cointype/:orderid', async (req, res) => {
	let paymentVerifier = factory.GetPaymentVerifier(req.params.cointype);

	let downloadCode;
	try {
		downloadCode = await paymentVerifier.GetDownloadCode(req.params.orderid, req.query);
	} catch (e) {
		sendErrorPageOnCatch(res, e);
		return;
	}

	let successPageBuilder = factory.GetDownloadPageBuilder();
	res.send(successPageBuilder.GetDownloadPageMarkup(downloadCode));
});

app.get('/download/:downloadcode', async (req, res) => {
	let downloadManager = factory.GetDownloadManager();
	let downloadCode = req.params.downloadcode;

	let downloadParams;
	try {
		downloadParams = downloadManager.GetDownloadParametersForDownloadCode(downloadCode);
	} catch (e) {
		sendErrorPageOnCatch(res, e);
		return;
	}

	res.download(downloadParams.FilePath, downloadParams.FileName, (error) => {
		if (!error) {
			downloadManager.IncrementDownloadCount(downloadCode);
		}
	});
});

app.get('/', async (req, res) => {
	res.status(400);
	sendErrorPageOnCatch(res, 'This app does not have a home page. You should try accessing it via a checkout link!');
});

// Handle 404
app.use(function(req, res) {
	res.status(400);
	sendErrorPageOnCatch(res, 'HTTP 404 - page not found.');
});

app.listen(port, () => {
	console.log(`Tortuga checkout app listening at http://localhost:${port}`);
});
