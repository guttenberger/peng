// @ts-check
const csvFilter = require("./filter-functions/csv-filter");
const { purposeAuthentication } = require("./auth-functions/purpose-auth");
const { attributeAuthentication } = require("./auth-functions/attribute-auth");


const accessFilter = (awsEvent, userRequestContext) => {
    console.log("Filter-Event:\n", JSON.stringify({ userRequestContext, awsEvent }, null, 2));

    const [hasAllowedPurpose, purposeContext] = purposeAuthentication(userRequestContext);
    const [hasAllowedAttributes] = attributeAuthentication(userRequestContext);

    return {
        isAllowed: hasAllowedPurpose && hasAllowedAttributes,
        responseContext: { purposeContext }
    };
}

const transformFilter = {
    "csv-filter": (csvFile, fields) => csvFilter.filter(csvFile, fields)
}

async function transform(awsEvent, userRequestContext, s3object) {
    console.log("Transform-Event:\n", JSON.stringify({ event: awsEvent, userRequestContext, s3object }, null, 2));

    const { operation, fields } = userRequestContext?.purposeContext?.filter ?? {};

    if (operation)
        return await transformFilter[operation](s3object, fields);

    return s3object;
}

module.exports = { accessFilter, transform };