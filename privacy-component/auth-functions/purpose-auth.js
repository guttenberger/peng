function purposeAuthentication(awsEvent, userRequestContext, purposeConfig) {
    // check for valid purpose token
    const hasAllowedPurposeToken = purposeConfig.purposeToken === userRequestContext.purposeToken;

    // check for valid date
    const hasAllowedPurposeDate = Date.now() < new Date(purposeConfig.expirationDate);

    return hasAllowedPurpose && hasAllowedPurposeDate;
}

module.exports = { purposeAuthentication }