const { S3 } = require("aws-sdk");

const s3 = new S3();

exports.handler = async (event, context) => {
    console.log("csv-archive-Event:\n", JSON.stringify(event, null, 2));

    const id = event.pathParameters?.id;

    if (!id && event.httpMethod === "GET") {
        const result = await s3.listObjectsV2({ Bucket: process.env.BUCKET_NAME }).promise();
        const filenames = result.Contents.map(content => content.Key);
        return { statusCode: 200, body: JSON.stringify({ filenames }) };
    }

    if (!id && event.httpMethod === "POST") {
        const filename = event.queryStringParameters?.filename;

        if (!filename) {
            const message = 'No filename in query parameter provided';
            const type = 'FilenameMissing';

            return {
                statusCode: 400,
                body: JSON.stringify({ error: message, type, requestId: event.requestId })
            };
        }
        // const file = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
        await s3.putObject({
            Bucket: process.env.BUCKET_NAME, // a path to your Bucket
            Key: filename, // a key (literally a path to your file)
            Body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
            ContentType: event.headers["Content-Type"]
        }).promise();

        return { statusCode: 200, body: "OK" };
    }

    if (!!id) {
        switch (event.httpMethod) {
            case "GET":
                return await getObject(event, context);
            case "PUT":
                return await putObject(event, context);
            case "DELETE":
                return await deleteObject(event, context);
            default:
                const message = `Unsupported HTTP method ${event.httpMethod}`;
                return {
                    statusCode: 405,
                    body: JSON.stringify({ error: message })
                };
        }
    }
}

async function getObject(event, context) {
    const { Body, ContentType, ContentLength } = await s3.getObject({
        Bucket: process.env.BUCKET_NAME, // a path to your Bucket
        Key: event.pathParameters.id // a key (literally a path to your file)
    }).promise();

    return {
        statusCode: 200,
        headers: {
            "Content-Type": ContentType,
            "Content-Length": ContentLength,
            "Access-Control-Allow-Origin": "*"
        },
        body: Body.toString('base64'),
        isBase64Encoded: true
    };
}

async function putObject(event, context) {
    await s3.putObject({
        Bucket: process.env.BUCKET_NAME, // a path to your Bucket
        Key: event.pathParameters.id, // a key (literally a path to your file)
        Body: event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body,
        ContentType: event.headers["Content-Type"]
    }).promise();

    return {
        statusCode: 200,
        body: "Ok",
    };
}

async function deleteObject(event, context) {
    await s3.deleteObject({
        Bucket: process.env.BUCKET_NAME, // a path to your Bucket
        Key: event.pathParameters.id // a key (literally a path to your file)
    }).promise();

    return {
        statusCode: 204
    };
}