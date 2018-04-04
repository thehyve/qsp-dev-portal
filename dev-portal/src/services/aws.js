import AWS from 'aws-sdk'
export const awsRegion = 'eu-central-1'
export const cognitoRegion = 'eu-central-1'
export const cognitoUserPoolId = 'eu-central-1_GprcbDCYJ'
export const cognitoIdentityPoolId = 'eu-central-1:25e8fa99-41fb-4243-bf8d-9f8f3dcd1edf'
export const cognitoClientId = '1bbt65k1kjr8ajebl2kpjitnlg'

AWS.config.region = cognitoRegion
