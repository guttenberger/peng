function attributeAuthentication(userRequestContext) {
    const allowedIpAddresses = ['83.135.78.120']

    return [allowedIpAddresses.includes(userRequestContext.userIpAddress)];
}

module.exports = { attributeAuthentication };