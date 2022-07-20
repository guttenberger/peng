# Advanced Privacy Friendly Access Control Component for aws s3 buckets

## Prerequisites

To make our component reusable we used the AWS Serverless Application Model, a guide on how it can be installed can be found [here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

In addition:
- [aws cli](https://docs.aws.amazon.com/de_de/cli/latest/userguide/getting-started-install.html)
- [NodeJs 16.10 or higher](https://nodejs.org/en/)

## How to use the privacy component
![Privacy component architecture](./diagrams/template.svg)

In order to add our privacy component in front of an existing s3 bucket we recommend to use aws cloudformation or aws sam and import our privacy component as a nested stack. An example use can be seen in our [prototype](./backend/template.yaml).

To add it in front of an existing s3 that was not created with aws sam or aws cloudformation. Change the parameters inside the [privacy component template](./privacy-component/template.yaml) and [deploy the changes](./README.md#deploy-changes)

Parameters of our privacy component are:
| Parameter | Description |
| --- | --- |
| deploymentEnvironment | *required*, the development stage the component should be created |
| S3BucketName | *required*, target s3 bucket where the privacy conform access should be added |
| Interceptors | *required*, Interceptors from interceptor-config.json that should be included to the privacy interceptor |

### Adding new interceptors

All interceptors are defined inside the [interceptor-config.json](./privacy-component/interceptor-config.json).
The config file defines the auth and the data transformation that is required to access s3 object. It has the following fields:

| Field | Description |
| --- | --- |
|name| *required*, the name will be used to import the interceptors to the privacy component|
|auth| *required*, list of auth function that should be used |
|filters| list of filter functions that should be used |

the auth field determines the auth functions that should be used the object consists of:
| Field | Description |
| --- | --- |
|type| *required*, will determine which auth function should be use |
|uniqueKey| *required*, declares wich config key is relevant for the auth function. The value of the config required field must be unique. |
|config| *required*, auth configuration object that will be used in the auth function |

the filters field determines the filter functions that should be used it consists of:
| Field | Description |
| --- | --- |
|type| *required*, will determine which filter function should be use |
|config| *required*, filter configuration object that will be used in the auth function |

#### Predefined auth functions
We provide 3 [auth functions](./privacy-component/auth-functions/index.js):
1. No Auth, skip authentication to use it set "no" as auth type
1. Purpose based access control
the Purpose based access control allows access based on a purpose token and the purpose date
To use it declare "purpose" as auth type and provide following auth configuration:

| Field | Description |
| --- | --- |
| purpose | name of the purpose |
| description | description of the purpose |
|purposeToken| *required*, will determine which filter function should be use |
|expirationDate| *required*, filter configuration object that will be used in the auth |
|purposeOwner| *required*, responsible person for the purpose |


2. Attribute based access control
the Attribute based access control allows access based on environmental attribute like the user ip address.
To use it declare "attribute" as auth type and provide following auth configuration:

| Field | Description |
| --- | --- |
| allowedIpAddresses | *required*, List of allowedIpAddresses |

#### Predefined filter functions
We provide 2 [filter functions](./privacy-component/filter-functions/index.js):

1. Jpg-filter
Perform jpg operation on the s3 object. to use it set "jpg-filter" as filter type and declare a config object with:

| Field | Description |
| --- | --- |
| transformation | *required*, transformation that should be applied currently "addNoiseToLocation" or "clearMetaData"|


2. Csv-filter
Perform jpg operation on the s3 object. to use it set "csv-filter" as filter type and declare a config object with:

| Field | Description |
| --- | --- |
| fields | *required*, List of fields that should be kept ,fields not defined here will be omitted. We also support field based operation for an example look into the example [interceptor-config.json](./privacy-component/interceptor-config.json) |

### Adding custom auth functions

In order to add a new custom auth functions 
1. add a new file with a auth function to the ./privacy-component/auth-function folder 

The function must accept 3 arguments and return an boolean. The 3 arguments are:

| Arguments | Description |
| --- | --- |
| awsEvent | *required*, the aws s3 object lambda event object 
| userRequestContext | *required*, user request context created from the queryString parameters and the user ip
| authConfig | *required*, config object defined in interceptor-config.json auth object

2. include it in the ./privacy-component/auth-function/index.js file
The key the functions in the export module object will be used as auth type in the interceptor-config.json

3. create interceptor which uses the auth function in interceptor-config.json. Set the key used in the index.js file as auth type

### Adding custom filter (transformation) functions
In order to add a new custom filter functions
1. add a new file with a filter function to the ./privacy-component/filter-function folder 

The function must accept 3 arguments and return an boolean. The 3 arguments are:

| Arguments | Description |
| --- | --- |
| s3Object | *required*, the s3Object that should be modified
| filterConfig | *required*, config object defined in interceptor-config.json filter object
| userRequestContext | *required*, user request context created from the queryString parameters and the user ip

2. include it in the ./privacy-component/filter-function/index.js file
The key the functions in the export module object will be used as filter type in the interceptor-config.json

3. create interceptor which uses the filter function in interceptor-config.json. Set the key used in the index.js file as filter type

### Deploy changes

1. Package and upload the artifacts into a predefined bucket (must be created first)
- "sam package --region eu-central-1 --s3-bucket <DEPLOYMENT_BUCKET> --output-template-file output-template.yaml",

2. Create the infrastructure
- "sam deploy --stack-name <STACK_NAME> --template-file output-template.yaml --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND",


Further Resources:
- [AWS Blogpost](https://aws.amazon.com/de/blogs/storage/managing-access-to-your-amazon-s3-objects-with-a-custom-authorizer/)