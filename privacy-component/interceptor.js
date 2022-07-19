// @ts-check
const authFunctions = require("./auth-functions/index.js");
const filterFunctions = require("./filter-functions/index.js");

const authenticate = (awsEvent, userRequestContext, authType, authConfig) => {
    console.log("Filter-Event:\n", JSON.stringify({ authType, authConfig, userRequestContext, awsEvent }, null, 2));

    // get and and run auth functions based on authType defined in the interceptor config
    return authFunctions[authType](awsEvent, userRequestContext, authConfig);
}

async function transform(awsEvent, filter = {}, userRequestContext, s3object) {
    console.log("Transform-Event:\n", JSON.stringify({ event: awsEvent, userRequestContext, s3object, filter }, null, 2));

    const { type, config } = filter;

    // get and and run filter functions based on filter type defined in the interceptor config
    if (type)
        return await filterFunctions[type](s3object, config);

    // return original object if no filter was defined
    return s3object;
}

module.exports = { authenticate, transform };