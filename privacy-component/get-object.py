import os
import boto3
import base64

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    s3Bucket = os.environ['S3_ACCESS_POINT']
    s3Key = event["pathParameters"]["id"] + "#" + event["queryStringParameters"]["purposeToken"]
    
    print(s3Bucket)
    print(s3Key)

    response = s3.get_object(Bucket=s3Bucket,Key=s3Key)

    print(response)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": response["ContentType"],
            "Content-Length": response["ContentLength"],
        },
        "body": base64.b64encode(response["Body"].read()).decode('utf-8'),
        "isBase64Encoded": True
    }
