function attributeAuthentication(awsEvent, userRequestContext, authConfig) {
    return authConfig.userIpAddress
        .some(allowedIp => userRequestContext.userIpAddress.includes(allowedIp));
}

module.exports = { attributeAuthentication };