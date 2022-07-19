// @ts-check
const csvFilter = require("./filter-functions/csv-filter");
const jpgFilter = require("./filter-functions/metadata-filter");
const { purposeAuthentication } = require("./auth-functions/purpose-auth");
const { attributeAuthentication } = require("./auth-functions/attribute-auth");

const authorizers = {
    "purpose": (awsEvent, userRequestContext, purposeConfig) =>
        purposeAuthentication(awsEvent, userRequestContext, purposeConfig),
    "attribute": (awsEvent, userRequestContext, attributeConfig) =>
        attributeAuthentication(awsEvent, userRequestContext, attributeConfig),
}

const accessFilter = (awsEvent, userRequestContext, authType, authConfig) => {
    console.log("Filter-Event:\n", JSON.stringify({ userRequestContext, awsEvent }, null, 2));

    return authorizers[authType](awsEvent, userRequestContext, authConfig);
}

const transformFilter = {
    "csv-filter": (csvFile, config) => csvFilter.filter(csvFile, config),
    "jpg-filter": (jpgFile, config) => jpgFilter.filter(jpgFile, config)
}

async function transform(awsEvent, filter, userRequestContext, s3object) {
    console.log("Transform-Event:\n", JSON.stringify({ event: awsEvent, userRequestContext, s3object }, null, 2));

    const { operation, config } = filter;

    if (operation)
        return await transformFilter[operation](s3object, config);

    return s3object;
}

module.exports = { accessFilter, transform };