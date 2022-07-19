function attributeAuthentication(awsEvent, userRequestContext, authConfig) {
    return authConfig.allowedIpAddresses
        .some(allowedIp => userRequestContext.userIpAddress.includes(allowedIp));
}

module.exports = { attributeAuthentication };