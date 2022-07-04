"use strict";

const { S3 } = require("aws-sdk");

const s3 = new S3();

exports.handler = async (event, context) => {
    // Output the event details to CloudWatch Logs.
    console.log("Event:\n", JSON.stringify(event, null, 2));

    // check auth
    // return await verifyAuth(event);

    // check file exits
}

async function verifyAuth(event) {
    // const allowAccess =

    await s3.writeGetObjectResponse({
        StatusCode: 403,
        ErrorCode: 'NotAuthorized',
        ErrorMessage: 'Not Authorized'
    });

    return { 'status_code': 403 }
}