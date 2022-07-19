const csvFilter = require("./csv-filter");
const jpgFilter = require("./metadata-filter");

module.exports = {
    "csv-filter": (csvFile, config) => csvFilter.filter(csvFile, config),
    "jpg-filter": (jpgFile, config) => jpgFilter.filter(jpgFile, config)
}