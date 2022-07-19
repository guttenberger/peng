// @ts-checks
const { S3 } = require("aws-sdk");

const { transform, authenticate } = require("./interceptor");
const interceptorConfigs = require("./interceptor-config.json");

const s3 = new S3();

// get interceptor config from interceptor-config.json
function getInterceptorConfig(interceptors, userContext) {
  const relevantInterceptors = interceptorConfigs
    .filter(interceptor => interceptors.includes(interceptor.name));

  // first try to find interceptor config by unique query param key
  const interceptorConfigByQueryParams = relevantInterceptors.find(
    interceptor => interceptor.auth?.some(
      auth => auth.config[auth.uniqueKey] === userContext[auth.uniqueKey]
    ));

  if (interceptorConfigByQueryParams)
    return interceptorConfigByQueryParams;

  // second try to find interceptor config by user ip
  const interceptorConfigByIp = relevantInterceptors.find(
    interceptor => interceptor.auth?.some(
      auth => auth.config["allowedIpAddresses"]
        .some(allowedIp => userContext.userIpAddress.includes(allowedIp))
    ));

  return interceptorConfigByIp;
}

// deny access to the (transformed) s3 object
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

// privacy interceptor
exports.handler = async (event, context) => {
  // Output the event details to CloudWatch Logs.
  console.log("PrivacyLambda-Event:\n", JSON.stringify({ event, context }, null, 2));

  const { outputRoute, outputToken } = event.getObjectContext;
  // get userContext from the url
  const [route, userContextString] = decodeURIComponent(event.userRequest.url).split("#CONTEXTSTART#");
  const userContext = JSON.parse(userContextString);

  // get component specific interceptors defined template.yaml
  const interceptors = JSON.parse(event.configuration.payload);

  // get needed interceptor config from interceptor-config.json
  const { auth, filters } = getInterceptorConfig(interceptors, userContext) ?? {};

  // if not interceptor config found
  if (!auth)
    return denyAccess(outputRoute, outputToken);

  // grant access based in the interceptor config defined authentications
  let isAllowed = true;

  for (const { type, config } of auth) {
    const isAuthorized = authenticate(event, userContext, type, config);
    isAllowed &&= isAuthorized;
  }

  // deny access if authentication conditions are not met
  if (!isAllowed)
    return denyAccess(outputRoute, outputToken);

  // read original s3 object form s3 bucket
  const supporting_access_point_arn = event["configuration"]["supportingAccessPointArn"];
  const s3key = route.split(`${event.userRequest.headers.Host}/`).pop();

  const { ContentType, Body } = await s3.getObject({
    Bucket: supporting_access_point_arn,
    Key: s3key
  }).promise();

  // transform s3 object based on interceptor authentication
  let modifiedObject;
  for (const filter of filters)
    modifiedObject = await transform(event, filter, userContext, modifiedObject ?? Body);

  // return modified object
  const params = {
    RequestRoute: outputRoute,
    RequestToken: outputToken,
    ContentType,
    Body: modifiedObject
  };

  await s3.writeGetObjectResponse(params).promise();

  // exit the Lambda function.
  return { statusCode: 200 };
};