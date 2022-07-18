function attributeAuthentication(userRequestContext) {
    const allowedIpAddresses = ['83.135.76.9']

    // return [allowedIpAddresses.includes(userRequestContext.userIpAddress)];
    return [true]
}

module.exports = { attributeAuthentication };