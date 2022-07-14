const purposeConfig = require("../purpose-config.json");

function purposeAuthentication(userRequestContext) {
    const purposeContext = purposeConfig.find(el => el.purposeToken === userRequestContext.purposeToken);

    return [!!purposeContext, purposeContext];
}

module.exports = { purposeAuthentication }