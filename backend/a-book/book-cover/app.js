"use strict";

exports.handler = async (event, context) => {
  // Output the event details to CloudWatch Logs.
  console.log("Event:\n", JSON.stringify(event, null, 2));

  return { 'status_code': 200 }
}