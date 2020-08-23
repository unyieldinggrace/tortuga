## Tortuga
### What is this?
Tortuga is a lightweight payment gateway, written using [ExpressJS](http://expressjs.com/ "ExpressJS"). The purpose is to make it as simple as possible to sell digital products in exchange for cryptocurrency.

### Demo
Want to see it in action? Click one of the crypto checkout links for my book, _Taxation is Slavery_ ([https://beingbiblical.com/books/taxation-is-slavery](https://beingbiblical.com/books/taxation-is-slavery))

### Current Features

- Sell a digital file for Bitcoin Cash (BCH).
- Sell a digital file for Nano (NANO/XRB).
- Customize the checkout, success and error pages (using mustache templates).
- Limit the maximum number of times a file can be downloaded after paying (prevent buyers from sharing the download link).

### Planned Features

- Support for more cryptocurrencies (next up is Monero, then possibly Bitcoin BTC and Dash).
- Discount codes.
- Maybe a UI for managing available products.

### How to Use

The repository contains a Dockerfile. Build the docker image and deploy it anywhere you wish. The "data" directory should be moved into a volume accessible to the docker container and mapped to /usr/app/src/data in the container's filesystem.

The default content of the data directory has everything you need for a working store. There is currently no UI for editing the HTML pages or for creating your own products. You will need to edit the mustache templates by hand to update the HTML. You can add your own product by adding a row to the Products table in the included SQLite database (tortuga.db). The fields are fairly self-explanatory.

You will also need to add your own XPub key (for Bitcoin Cash) and/or your own Nano address in `data/config.json`

Once deployed, you can test by going to http://your-domain/checkout/bitcoin-cash/your-product-code
In the example data directory, the sample product is the preview of my book _Taxation is Slavery_.

### Philiosophy

The name "Tortuga" comes from the Carribean island of the same name. The island is featured in the popular "Pirates of the Carribean" films. In the films, characters refer to Tortuga as either a "free" port or a "pirate" port. In the context of the films, these words have the same meaning. The port of tortuga is "free" because the people there are free to buy and sell without interference. The term "pirate port" is a perjorative term used by the characters who represent the interests of the tyrannical European royalty (such as the British naval officers).

In reality, free trade and economic freedom are two of the best things we could possibly do to make the world a better place. Cryptocurrency matters, because it means more economic freedom for the world, less wars and less abuse of government power.

* More about the benefits of cryptocurrency: https://www.youtube.com/watch?v=6UQ3plheIgc
* More about the benefits of free trade in general: https://www.youtube.com/watch?v=xqh0zXSd4vc

