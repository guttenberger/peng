"use strict";

const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
    console.log("Patients-Event:\n", JSON.stringify(event, null, 2));

    const id = event.pathParameters?.id;
    const { TABLE_NAME } = process.env;

    const body = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString()
        : event.body;

    switch (event.httpMethod) {
        // add a book to the library
        case "POST":
            const bookId = uuidv4();
            dynamodb.putItem(
                {
                    Item: AWS.DynamoDB.Converter.marshall({
                        ...JSON.parse(body),
                        id: bookId
                    }),
                    TableName: TABLE_NAME
                },
                (err, data) => {
                    if (err)
                        callback(null, {
                            statusCode: 400,
                            headers: {
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({ error: err })
                        });
                    exports.handler(
                        { pathParameters: { id: bookId }, httpMethod: "GET" },
                        context,
                        callback
                    );
                }
            );
            break;

        // get list of books from library
        case "GET":
            if (id) {
                dynamodb.getItem(
                    {
                        Key: AWS.DynamoDB.Converter.marshall({ id }),
                        TableName: TABLE_NAME
                    },
                    (err, data) => {
                        if (err)
                            callback(null, {
                                statusCode: 400,
                                headers: {
                                    "Access-Control-Allow-Origin": "*"
                                },
                                body: JSON.stringify({ error: err })
                            });
                        callback(null, {
                            statusCode: 200,
                            headers: {
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify(AWS.DynamoDB.Converter.unmarshall(data.Item))
                        });
                    }
                );
                return;
            }

            dynamodb.scan({ TableName: TABLE_NAME }, (err, data) => {
                if (err)
                    callback(null, {
                        statusCode: 400,
                        headers: {
                            "Access-Control-Allow-Origin": "*"
                        },
                        body: JSON.stringify({ error: err })
                    });
                callback(null, {
                    statusCode: 200,
                    headers: {
                        "Access-Control-Allow-Origin": "*"
                    },
                    body: JSON.stringify(
                        data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item))
                    )
                });
            });
            break;

        // update an existing book from the library
        case "PUT":
            dynamodb.getItem(
                {
                    Key: AWS.DynamoDB.Converter.marshall({ id }),
                    TableName: TABLE_NAME
                },
                (err, data) => {
                    if (err)
                        callback(null, {
                            statusCode: 400,
                            headers: {
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({ error: err })
                        });

                    const retrievedItem = AWS.DynamoDB.Converter.unmarshall(data.Item);

                    const newItem = {
                        ...retrievedItem,
                        ...JSON.parse(body),
                        id
                    };

                    dynamodb.putItem(
                        {
                            Item: AWS.DynamoDB.Converter.marshall(newItem),
                            TableName: TABLE_NAME
                        },
                        (err, data) => {
                            if (err)
                                callback(null, {
                                    statusCode: 400,
                                    headers: {
                                        "Access-Control-Allow-Origin": "*"
                                    },
                                    body: JSON.stringify({ error: err })
                                });
                            callback(null, {
                                statusCode: 200,
                                headers: {
                                    "Access-Control-Allow-Origin": "*"
                                },
                                body: JSON.stringify(
                                    data.Items.map(item =>
                                        AWS.DynamoDB.Converter.unmarshall(item)
                                    )
                                )
                            });
                        }
                    );
                }
            );
            break;

        // delete a book from the library
        case "DELETE":
            dynamodb.deleteItem(
                {
                    Key: AWS.DynamoDB.Converter.marshall({ id }),
                    TableName: TABLE_NAME
                },
                (err, data) => {
                    if (err)
                        callback(null, {
                            statusCode: 400,
                            headers: {
                                "Access-Control-Allow-Origin": "*"
                            },
                            body: JSON.stringify({ error: err })
                        });
                    callback(null, {
                        statusCode: 200,
                        headers: {
                            "Access-Control-Allow-Origin": "*"
                        },
                        body: JSON.stringify({})
                    });
                }
            );
            break;

        // http method is not supported
        default:
            const message = `Unsupported HTTP method ${event.httpMethod}`;
            callback(null, {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({ error: message })
            });
    }
};
