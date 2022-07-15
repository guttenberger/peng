const { S3 } = require("aws-sdk");

const { transform, accessFilter } = require("./interceptor");

const s3 = new S3();

exports.handler = async (event, context) => {
  // Output the event details to CloudWatch Logs.
  console.log("PrivacyLambda-Event:\n", JSON.stringify({ event, context }, null, 2));

  const { getObjectContext } = event;
  const { outputRoute, outputToken } = getObjectContext;

  const [route, userContextString] = decodeURIComponent(event.userRequest.url).split("#CONTEXTSTART#");
  const userContext = JSON.parse(userContextString);

  const { isAllowed, responseContext } = accessFilter(event, userContext);

  if (!isAllowed) {
    await s3.writeGetObjectResponse({
      StatusCode: 403,
      ErrorCode: 'NotAuthorized',
      ErrorMessage: 'Not Authorized',
      RequestRoute: outputRoute,
      RequestToken: outputToken
    }).promise();

    return { 'status_code': 403 }
  }

  const supporting_access_point_arn = event["configuration"]["supportingAccessPointArn"];
  const s3key = route.split(`${event.userRequest.headers.Host}/`).pop();

  const { ContentType, Body } = await s3.getObject({
    Bucket: supporting_access_point_arn,
    Key: s3key
  }).promise();

  const modifiedObject = await transform(event, responseContext, Body);

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