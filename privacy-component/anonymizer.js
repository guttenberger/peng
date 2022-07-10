const { S3 } = require("aws-sdk");

const { transform, accessFilter } = require("./interceptor");

const s3 = new S3();

exports.handler = async (event) => {
  // Output the event details to CloudWatch Logs.
  console.log("Datatransform-Event:\n", JSON.stringify(event, null, 2));

  const { getObjectContext } = event;
  const { outputRoute, outputToken } = getObjectContext;

  const [route, purposeToken] = event.userRequest.url.split(encodeURIComponent("#"));

  const { isAllowed, responseContext } = accessFilter(event, {}, purposeToken);
  console.log({ isAllowed, responseContext });

  if (!isAllowed) {
    await s3.writeGetObjectResponse({
      StatusCode: 403,
      ErrorCode: 'NotAuthorized',
      ErrorMessage: 'Not Authorized'
    }).promise();

    return { 'status_code': 403 }
  }

  const supporting_access_point_arn = event["configuration"]["supportingAccessPointArn"];
  const s3key = route.split(`${event.userRequest.headers.Host}/`).pop();

  const { ContentType, Body, ContentLength } = await s3.getObject({
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

  console.log(params);

  await s3.writeGetObjectResponse(params).promise();

  // Exit the Lambda function.
  return { statusCode: 200 };
};