const NodeGeocoder = require('node-geocoder');

const options = { provider: 'mapquest', apiKey: 'Mb44OIlLrG6Xq1vQWGZiS0w6blUK80Aw', httpAdapter: 'https', formatter: null };

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
