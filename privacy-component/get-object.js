const { S3 } = require("aws-sdk");

const s3 = new S3();

exports.handler = async (event) => {
  // Output the event details to CloudWatch Logs.
  console.log("BucketAccess-Event:\n", JSON.stringify(event, null, 2));

  const { S3_ACCESS_POINT } = process.env;
  const { id } = event.pathParameters;
  const params =
  {
    Bucket: S3_ACCESS_POINT, // a path to your Bucket
    Key: id // a key (literally a path to your file)
  }

  console.log("S3Params-Event:\n", JSON.stringify({ params }, null, 2));
  const result = await s3.getObject(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      {
        image: result.Body.toString('base64'),
      },
      null,
      2,
    ),
  };
};