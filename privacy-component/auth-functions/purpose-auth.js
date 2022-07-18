const purposeConfig = require("../purpose-config.json");

function purposeAuthentication(userRequestContext) {
    const purpose = purposeConfig.find(el => el.purposeToken === userRequestContext.purposeToken);
    const isAllowed = purpose && Date.now() < new Date(purpose.expirationDate);

    return [isAllowed, purpose];
}

module.exports = { purposeAuthentication }