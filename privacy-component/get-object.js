const { S3 } = require("aws-sdk");

const s3 = new S3();

exports.handler = async (event) => {
  // Output the event details to CloudWatch Logs.
  console.log("BucketAccess-Event:\n", JSON.stringify(event, null, 2));

  const { S3_ACCESS_POINT, HTTPS_S3_ACCESS_POINT } = process.env;
  const { id } = event.pathParameters;

  const params =
  {
    Bucket: S3_ACCESS_POINT, // a path to your Bucket
    Key: `${id}#test` // a key (literally a path to your file)
  }

  console.log("S3Params-Event:\n", JSON.stringify({ params }, null, 2));
  const result = await s3.getObject(params).promise();

  // AccessPointName-AccountId.s3-object-lambda.Region.amazonaws.com.
  // const url = https://peng-anon-197938948806.s3-object-lambda.eu-central-1.amazonaws.com

  // console.log("S3Params-Event:\n", JSON.stringify({ HTTPS_S3_ACCESS_POINT }, null, 2));
  // const { data } = await axios.get(HTTPS_S3_ACCESS_POINT + '/' + id, {
  //   responseType: "arraybuffer", headers: {
  //     ...event.headers,
  //     ...event.multiValueHeaders.entries((key, value) => )
  //   }
  // });

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