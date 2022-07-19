function purposeAuthentication(awsEvent, userRequestContext, purposeConfig) {
    const hasAllowedPurposeToken = purposeConfig.purposeToken === userRequestContext.purposeToken;
    const hasAllowedPurpose = hasAllowedPurposeToken && Date.now() < new Date(purposeConfig.expirationDate);

    return hasAllowedPurpose;
}

module.exports = { purposeAuthentication }