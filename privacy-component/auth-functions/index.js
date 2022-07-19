const { purposeAuthentication } = require("./purpose-auth");
const { attributeAuthentication } = require("./attribute-auth");

// export auth functions, which are accessed by the auth type defined in interceptor-config.json
module.exports = {
    "purpose": (awsEvent, userRequestContext, purposeConfig) =>
        purposeAuthentication(awsEvent, userRequestContext, purposeConfig),
    "attribute": (awsEvent, userRequestContext, attributeConfig) =>
        attributeAuthentication(awsEvent, userRequestContext, attributeConfig),
    "no": (awsEvent, userRequestContext, attributeConfig) => true
}