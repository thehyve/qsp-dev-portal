import { awsRegion } from './aws'
let apiGatewayClient;

export function initApiGatewayClient({ accessKeyId, secretAccessKey, sessionToken } = {}) {
  apiGatewayClient = window.apigClientFactory.newClient({
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      sessionToken: sessionToken,
      region: awsRegion
    });
  return apiGatewayClient;
}

export function lookupApiGatewayClient() {
  if (apiGatewayClient) {
    return Promise.resolve(apiGatewayClient);
  }

  return new Promise(resolve => {
    const poller = window.setInterval(() => {
      if (apiGatewayClient) {
        window.clearInterval(poller);
        resolve(apiGatewayClient)
      }
    }, 100)
  })
}
