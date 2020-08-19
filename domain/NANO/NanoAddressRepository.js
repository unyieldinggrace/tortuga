const config = require('../../data/config.json');

class NanoAddressRepository {

	GetNextAddress() {
		return config.NanoAddress;
	}

}

module.exports = NanoAddressRepository;
