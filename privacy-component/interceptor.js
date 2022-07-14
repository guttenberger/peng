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