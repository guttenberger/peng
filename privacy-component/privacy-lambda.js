// @ts-checks
const { S3 } = require("aws-sdk");

const { transform, accessFilter } = require("./interceptor");
const interceptorConfigs = require("./interceptor-config.json");

const s3 = new S3();

function getInterceptorConfig(userContext) {
  return interceptorConfigs.find(
    interceptor => interceptor.auth?.some(
      auth => auth.config[auth.uniqueKey] === userContext[auth.uniqueKey]
    ));
}

async function denyAccess(outputRoute, outputToken) {
  await s3.writeGetObjectResponse({
    StatusCode: 403,
    ErrorCode: 'NotAuthorized',
    ErrorMessage: 'Not Authorized',
    RequestRoute: outputRoute,
    RequestToken: outputToken
  }).promise();

  return { statusCode: 200 };
}

exports.handler = async (event, context) => {
  // Output the event details to CloudWatch Logs.
  console.log("PrivacyLambda-Event:\n", JSON.stringify({ event, context }, null, 2));

  const { outputRoute, outputToken } = event.getObjectContext;
  const [route, userContextString] = decodeURIComponent(event.userRequest.url).split("#CONTEXTSTART#");
  const userContext = JSON.parse(userContextString);
  const { auth, filters } = getInterceptorConfig(userContext) ?? {};

  if (!auth)
    return denyAccess(outputRoute, outputToken);

  let isAllowed = true;

  for (const { type, config } of auth) {
    const isAuthorized = accessFilter(event, userContext, type, config);
    isAllowed &&= isAuthorized;
  }

  if (!isAllowed)
    return denyAccess(outputRoute, outputToken);

  const supporting_access_point_arn = event["configuration"]["supportingAccessPointArn"];
  const s3key = route.split(`${event.userRequest.headers.Host}/`).pop();

  const { ContentType, Body } = await s3.getObject({
    Bucket: supporting_access_point_arn,
    Key: s3key
  }).promise();

  let modifiedObject;
  for (const filter of filters)
    modifiedObject = await transform(event, filter, userContext, modifiedObject ?? Body);

  const params = {
    RequestRoute: outputRoute,
    RequestToken: outputToken,
    ContentType,
    Body: modifiedObject
  };

  await s3.writeGetObjectResponse(params).promise();

  // Exit the Lambda function.
  return { statusCode: 200 };
};