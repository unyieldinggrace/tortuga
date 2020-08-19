BEGIN TRANSACTION;

INSERT INTO Products (Name, Price, Currency, ProductShortCode, Path, MaxDownloads, DownloadFileName, ImageURL)
	VALUES (
		'Taxation is Slavery [PDF eBook]'
		, 7
		, 'USD'
		, 'taxation-is-slavery-ebook'
		, 'Taxation is Slavery - PDF eBook With Cover - Preview.pdf'
		, 10
		, 'Taxation is Slavery - PDF eBook With Cover - Preview.pdf'
		,'taxation-is-slavery-book.jpg'
	);

COMMIT;
