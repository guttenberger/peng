function purposeAuthentication(awsEvent, userRequestContext, authConfig) {
    // check for valid purpose token
    const hasAllowedPurposeToken = authConfig.purposeToken === userRequestContext.purposeToken;

    // check for valid date
    const hasAllowedPurposeDate = Date.now() < new Date(authConfig.expirationDate);

    return hasAllowedPurposeToken && hasAllowedPurposeDate;
}

module.exports = { purposeAuthentication }