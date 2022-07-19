const csvFilter = require("./csv-filter");
const jpgFilter = require("./metadata-filter");

// filter functions must export a function that accepts the
// s3object and the filter config defined in interceptor
module.exports = {
    "csv-filter": (csvFile, config) => csvFilter.filter(csvFile, config),
    "jpg-filter": (jpgFile, config) => jpgFilter.filter(jpgFile, config)
}