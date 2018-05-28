import AWS from 'aws-sdk/global';

// Do not modify the constants below, they are set from the scripts/(post-|de)configure.js scripts.
export const awsRegion = 'eu-central-1';
export const cognitoRegion = 'eu-central-1';
export const cognitoUserPoolId = 'eu-central-1_HKw63q04h';
export const cognitoIdentityPoolId = 'eu-central-1:4c2f83da-5d98-44ca-b64e-8854dc58656c';
export const cognitoClientId = '3df4nk6fg157s71k0qf5po7ldd';
export const apigInvokeUrl = 'https://bbw37tzkm2.execute-api.eu-central-1.amazonaws.com/prod';

AWS.config.region = cognitoRegion;
