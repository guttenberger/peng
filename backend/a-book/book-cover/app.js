const { S3 } = require("aws-sdk");

const s3 = new S3();

exports.handler = async (event) => {
  const { BUCKET_NAME } = process.env;
  // Output the event details to CloudWatch Logs.
  console.log("BucketAccess-Event:\n", JSON.stringify(event, null, 2));

  const path = event.requestContext.resourcePath;

  const params =
  {
    Bucket: path, // a path to your Bucket
    Key: 'test.png' // a key (literally a path to your file)
  }

  const result = await s3.getObject(params).promise();

  console.log(result);

  // Exit the Lambda function.
  return { statusCode: 200 };
};