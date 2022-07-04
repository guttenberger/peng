"use strict";

exports.handler = async (event, context) => {
  // Output the event details to CloudWatch Logs.
  console.log("Auth-Event:\n", JSON.stringify(event, null, 2));

  const { purpose } = event.queryStringParameters.purpose;

  const isAuthorized = purpose === "testabc";

  let response = {
    isAuthorized,
    "context": {
      "purpose": "value",
    }
  };

  return response;
}
