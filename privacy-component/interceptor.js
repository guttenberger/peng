// @ts-check
const authFunctions = require("./auth-functions/index.js");
const filterFunctions = require("./filter-functions/index.js");

const accessFilter = (awsEvent, userRequestContext, authType, authConfig) => {
    console.log("Filter-Event:\n", JSON.stringify({ authType, authConfig, userRequestContext, awsEvent }, null, 2));

    return authFunctions[authType](awsEvent, userRequestContext, authConfig);
}

async function transform(awsEvent, filter, userRequestContext, s3object) {
    console.log("Transform-Event:\n", JSON.stringify({ event: awsEvent, userRequestContext, s3object, filter }, null, 2));

    const { type, config } = filter ?? {};

    if (type)
        return await filterFunctions[type](s3object, config);

    return s3object;
}

module.exports = { accessFilter, transform };