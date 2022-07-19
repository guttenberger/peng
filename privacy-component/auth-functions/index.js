const { purposeAuthentication } = require("./purpose-auth");
const { attributeAuthentication } = require("./attribute-auth");

module.exports = {
    "purpose": (awsEvent, userRequestContext, purposeConfig) =>
        purposeAuthentication(awsEvent, userRequestContext, purposeConfig),
    "attribute": (awsEvent, userRequestContext, attributeConfig) =>
        attributeAuthentication(awsEvent, userRequestContext, attributeConfig),
}