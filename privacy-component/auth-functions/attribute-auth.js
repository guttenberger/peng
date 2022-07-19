function attributeAuthentication(awsEvent, userRequestContext, authConfig) {
    // check for valid ip address
    return authConfig.allowedIpAddresses
        .some(allowedIp => userRequestContext.userIpAddress.includes(allowedIp));
}

module.exports = { attributeAuthentication };