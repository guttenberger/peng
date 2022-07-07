const { S3 } = require("aws-sdk");
const axios = require("axios").default;
const https = require("https");

const { transform } = require("./interceptor");

const s3 = new S3();

async function httpPromise(urlOptions, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(urlOptions, res => {
      let body = '';

      res.on('data', chunk => body += chunk.toString())
      res.on('error', reject)
      res.on('end', () => {
        const { statusCode, headers } = res
        const validResponse = statusCode >= 200 && statusCode <= 299

        if (validResponse) resolve({ statusCode, headers, body })
        else reject(new Error(`Request failed. status: ${statusCode}, body: ${body}`))
      })
    })

    req.on('error', reject)
    req.write(data, 'binary')
    req.end()
  });
}

exports.handler = async (event) => {
  // Output the event details to CloudWatch Logs.
  console.log("Datatransform-Event:\n", JSON.stringify(event, null, 2));

  // Retrieve the operation context object from the event.
  // This contains the info for the WriteGetObjectResponse request.
  // Includes a presigned URL in `inputS3Url` to download the requested object.
  const { getObjectContext } = event;
  const { outputRoute, outputToken, inputS3Url } = getObjectContext;

  // Get image stored in S3 accessible via the presigned URL `inputS3Url`.
  // const { data } = await httpPromise(inputS3Url);
  const { data } = await axios.get(inputS3Url, { responseType: "arraybuffer" });

  await transform(data);
  // // Resize the image
  // // Height is optional, will automatically maintain aspect ratio.
  // // withMetadata retains the EXIF data which preserves the orientation of the image.
  // // const resized = await sharp(data).resize({ width: 100, height: 100 }).withMetadata();

  // Send the resized image back to S3 Object Lambda.
  const params = {
    RequestRoute: outputRoute,
    RequestToken: outputToken,
    Body: data,
  };

  await s3.writeGetObjectResponse(params).promise();

  // Exit the Lambda function.
  return { statusCode: 200 };
};