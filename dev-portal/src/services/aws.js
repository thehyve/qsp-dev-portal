import AWS from 'aws-sdk'
export const awsRegion = 'eu-central-1'
export const cognitoRegion = 'eu-central-1'
export const cognitoUserPoolId = 'eu-central-1_r8GFpSaUO'
export const cognitoIdentityPoolId = 'eu-central-1:f2d185a1-16d9-4961-9a1c-e31f6581cab7'
export const cognitoClientId = '7chtqnlmmubd28t6v7bo74511h'

AWS.config.region = cognitoRegion
