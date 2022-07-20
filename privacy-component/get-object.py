import os
import boto3
import base64
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(f'GetObject-Event: {event}')

    s3 = boto3.client('s3')
    s3Bucket = os.environ['S3_ACCESS_POINT']
    # userContext send to s3 object bucket
    userContext = {}

    # write queryStringParameters to userContext
    if event['queryStringParameters'] is not None:
        userContext = event['queryStringParameters']

    # write user ip address to userContext
    userContext['userIpAddress'] = event['requestContext']['identity']['sourceIp']
    # write user arn (only for authenticated users) to userContext
    userContext['userArn'] = event['requestContext']['identity']['userArn']

    userContextJson = json.dumps(userContext)

    if "#CONTEXTSTART#" in event['pathParameters']['id']:
        raise ValueError('S3 File is not allowed to have #CONTEXTSTART# in name')

    # append userContext to s3Key
    s3Key = event['pathParameters']['id'] + '#CONTEXTSTART#' + userContextJson
    try:
        # trigger s3 object lambda
        response = s3.get_object(Bucket=s3Bucket, Key=s3Key)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": response["ContentType"],
                "Content-Length": response["ContentLength"],
                "Access-Control-Allow-Origin": "*"
            },
            "body": base64.b64encode(response["Body"].read()).decode('utf-8'),
            "isBase64Encoded": True
        }
    
    except Exception as e:
        logger.info(f'GetObject-Exception: {e.response}')

        exception_type = e.response['Error']['Code']
        exception_message = e.response['Error']['Message']
        exception_status_code = e.response['ResponseMetadata']['HTTPStatusCode']

        return {
            "statusCode": exception_status_code,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "type": exception_type,
                "error": exception_message,
                "requestId": event["requestContext"]["requestId"],
            })
        }
