import { awsRegion } from './aws'
export let apiGatewayClient

export function initApiGatewayClient({ accessKeyId, secretAccessKey, sessionToken } = {}) {
  console.log('i am here')
  apiGatewayClient = window.apigClientFactory.newClient({
      accessKey: accessKeyId,
      secretKey: secretAccessKey,
      sessionToken: sessionToken,
      region: awsRegion
    })
  console.log(apiGatewayClient)
}

export function getApiGatewayClient() {
  console.log('get api client')
  if (apiGatewayClient) return Promise.resolve(apiGatewayClient)
  console.log('no client avails')

  return new Promise(resolve => {
    const poller = window.setInterval(() => {
      if (apiGatewayClient) {
        window.clearInterval(poller)
        resolve(apiGatewayClient)
      }
    }, 100)
  })
}
