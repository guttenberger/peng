const purposeConfig = require("./purpose-config.json");
const csvFilter = require("./filters/csv-filter");

const accessFilter = (awsEvent, userRequestContext) => {
    console.log("Filter-Event:\n", JSON.stringify({ userRequestContext, awsEvent }, null, 2));

    const [hasAllowedPurpose, purposeContext] = purposeAuthentication(userRequestContext);
    // const [hasAllowedIp] = ipAuthentication(userRequestContext)

    return {
        // isAllowed: hasAllowedPurpose && hasAllowedIp,
        isAllowed: hasAllowedPurpose,
        responseContext: { purposeContext }
    };
}

function purposeAuthentication(userRequestContext) {
    const purposeContext = purposeConfig.find(el => el.purposeToken === userRequestContext.purposeToken);

    return [!!purposeContext, purposeContext];
}

function ipAuthentication(userRequestContext) {
    const allowedIpAddresses = ['83.135.78.120']

    return [allowedIpAddresses.includes(userRequestContext.userIpAddress)];
}

async function transform(awsEvent, userRequestContext, s3object) {
    console.log("Transform-Event:\n", JSON.stringify({ event: awsEvent, userRequestContext, s3object }, null, 2));

    const { transform } = userRequestContext.purposeContext;

    switch (transform["transform-operation"]) {
        case "csv-filter":
            return await csvFilter.filter(s3object, transform.fields);
    }

    return s3object;
}

module.exports = { accessFilter, transform };