'use strict';
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const apigateway = new AWS.APIGateway();

const customersTable = 'DevPortalCustomers';
const cognitoClient = new AWS.CognitoIdentityServiceProvider({region: `${process.env.AWS_DEFAULT_REGION}`});

function ensureUser(cognitoIdentityId, accessKey, error, callback) {
    const customerId = cognitoIdentityId; // + '+' + keyId

    // ensure user is tracked in customer table
    const getParams = {
        TableName: customersTable,
        Key: {
            Id: customerId
        }
    };
    dynamoDb.getItem(getParams, (err, data) => {
        if (err) {
            error(err)
        } else if (data.Item === undefined) {
          createApiKey(cognitoIdentityId, error, (keyId) => {
            const putParams = {
              TableName: customersTable,
              Item: {
                Id: customerId,
                ApiKeyId: keyId
              }
            };

            dynamoDb.putItem(putParams, (customerErr, customerData) => {
              if (customerErr) {
                error(customerErr)
              } else {
                console.log(`Created new customer in ddb with id ${customerId}`);
                callback(customerData)
              }
            })
          });
        } else {
            console.log(`Customer exists with id ${customerId}`);
            callback(data.Item)
        }
    })
}

function getCognitoIdentityId(marketplaceCustomerId, error, callback) {
    const params = {
        TableName: customersTable,
        IndexName: "MarketplaceCustomerIdIndex",
        KeyConditionExpression: "MarketplaceCustomerId = :customerId",
        ExpressionAttributeValues: {
            ":customerId": marketplaceCustomerId
        },
        ProjectionExpression: "MarketplaceCustomerId, Id"
    };
    dynamoDb.query(params, (err, data) => {
        if (err) {
            error(err)
        } else if (data.Items === undefined || data.Items.length === 0) {
            // no customer matching marketplaceCustomerId - this should be created during marketplace subscription redirect
            error(`No customer is registered in the developer portal for marketplace customer ID ${marketplaceCustomerId}`)
        } else {
            callback(data.Items[0].Id)
        }
    })
}

function subscribe(cognitoIdentityId, usagePlanId, errFunc, callback) {
    getUserApiKeyId(cognitoIdentityId, errFunc, (keyId) => {
        console.log(`Get Api Key ${keyId}`);

        if (!keyId) {
            console.log(`No API Key found for customer ${cognitoIdentityId}`);

            createApiKey(cognitoIdentityId, errFunc, (createData) => {
                console.log(`Create API Key data: ${createData}`);
                const keyId = createData.id;

                console.log(`Got key ID ${keyId}`);

                createUsagePlanKey(keyId, usagePlanId, errFunc, (createKeyData) => {
                    callback(createKeyData)
                })
            })
        } else {
            console.log(`Got key ID ${keyId}`);

            createUsagePlanKey(keyId, usagePlanId, errFunc, (createKeyData) => {
                callback(createKeyData)
            })
        }
    })
}

function unsubscribe(cognitoIdentityId, usagePlanId, error, success) {
  getUserApiKeyId(cognitoIdentityId, error, (keyId) => {
        console.log(`Get Api Key data ${keyId}`);

        if (!keyId) {
            console.log(`No API Key found for customer ${cognitoIdentityId}`);

            error('Customer does not have an API Key')
        } else {
            console.log(`Found API Key for customer with ID ${keyId}`);

            deleteUsagePlanKey(keyId, usagePlanId, error, (deleteData) => {
                success(deleteData)
            })
        }
    })
}

function createApiKey(cognitoIdentityId, error, callback) {
    console.log(`Creating API Key for customer ${cognitoIdentityId}`);

    // set the name to the cognito identity ID so we can query API Key for the cognito identity
    const params = {
        description: `Dev Portal API Key for ${cognitoIdentityId}`,
        enabled: true,
        generateDistinctId: true,
        name: cognitoIdentityId
    };

    apigateway.createApiKey(params, (err, data) => {
        if (err) {
          console.log('createApiKey error', error);
          error(err)
        } else if (!data) {
          error('No response')
        } else {
          callback(data.id);
        }
    })
}

function createUsagePlanKey(keyId, usagePlanId, error, callback) {
    console.log(`Creating usage plan key for key id ${keyId} and usagePlanId ${usagePlanId}`);

    const params = {
        keyId,
        keyType: 'API_KEY',
        usagePlanId
    };
    apigateway.createUsagePlanKey(params, (err, data) => {
        if (err) error(err);
        else callback(data)
    })
}

function deleteUsagePlanKey(keyId, usagePlanId, error, callback) {
    console.log(`Deleting usage plan key for key id ${keyId} and usagePlanId ${usagePlanId}`);

    const params = {
        keyId,
        usagePlanId
    };
    apigateway.deleteUsagePlanKey(params, (err, data) => {
        if (err) error(err);
        else callback(data)
    })
}

function getApiKeyForCustomer(cognitoIdentityId, error, callback) {
  console.log(`Getting API Key for customer  ${cognitoIdentityId}`);

  getUserApiKeyId(cognitoIdentityId, error, (apiKey) => {
    if (apiKey) {
      apigateway.getApiKey({apiKey, includeValue: true}, (err, data) => {
        if (err) error(err);
        else callback(data)
      });
    } else {
      callback(null);
    }
  });
}


function getUserApiKeyId(cognitoIdentityId, error, callback) {
  console.log(`Getting API Key ID for customer  ${cognitoIdentityId}`);

  const dbParams = {
    TableName: customersTable,
    Key: {
      Id: {
        S: cognitoIdentityId
      }
    }
  };

  dynamoDb.getItem(dbParams, (err, data) => {
    if (err) {
      error(err)
    } else if (data.Item === undefined) {
      console.log(`No API Key found for customer ${cognitoIdentityId}`);
      callback(null);
    } else {
      console.log(`Got key ID ${keyId}`);
      callback(data.Item.ApiKeyId)
    }
  });

  apigateway.getApiKey(params, (err, data) => {
    if (err) error(err);
    else callback(data)
  })
}

function getUsagePlansForCustomer(cognitoIdentityId, error, callback) {
    console.log(`Getting API Key for customer ${cognitoIdentityId}`);

    getUserApiKeyId(cognitoIdentityId, error, (keyId) => {
        if (!keyId) {
            callback({data : {}})
        } else {
            const params = {
                keyId,
                limit: 1000
            };
            apigateway.getUsagePlans(params, (err, usagePlansData) => {
                if (err) error(err);
                else callback(usagePlansData)
            })
        }
    })
}

function getUsagePlanForProductCode(productCode, error, callback) {
    console.log(`Getting Usage Plan for product ${productCode}`);

    // do a linear scan of usage plans for name matching productCode
    const params = {
        limit: 1000
    };
    apigateway.getUsagePlans(params, function(err, data) {
        if (err) {
            error(err)
        } else {
            console.log(`Got usage plans ${JSON.stringify(data.items)}`);

            // note: ensure that only one usage plan maps to a given marketplace product code
            const usageplan = data.items.find(function (item) {
                return item.productCode !== undefined && item.productCode === productCode
            });
            if (usageplan !== undefined) {
                console.log(`Found usage plan matching ${productCode}`);
                callback(usageplan)
            } else {
                console.log(`Couldn't find usageplan matching product code ${productCode}`);
                error(`Couldn't find usageplan matching product code ${productCode}`)
            }
        }
    });
}

function updateCustomerMarketplaceId(cognitoIdentityId, marketplaceCustomerId, error, success) {
    const dynamoDbParams = {
        TableName: customersTable,
        Key: {
            Id: cognitoIdentityId
        },
        UpdateExpression: 'set #a = :x',
        ExpressionAttributeNames: { '#a': 'MarketplaceCustomerId' },
        ExpressionAttributeValues: {
            ':x': marketplaceCustomerId
        }
    };

    // update DDB customer record with marketplace customer id
    // and update API Gateway API Key with marketplace customer id
    dynamoDb.update(dynamoDbParams, (dynamoDbErr) => {
        if (dynamoDbErr) {
            error(dynamoDbErr)
        } else {
            getUserApiKeyId(cognitoIdentityId, error, (keyId) => {
                console.log(`Get Api Key data ${JSON.stringify(data)}`);

                if (!keyId) {
                    console.log(`No API Key found for customer ${cognitoIdentityId}`);

                    createApiKey(cognitoIdentityId, errFunc, (createData) => {
                        console.log(`Create API Key data: ${createData}`);
                        success(createData);
                    })
                } else {
                    console.log(`Got key ID ${keyId}`);

                    updateApiKey(keyId, marketplaceCustomerId, error, (createKeyData) => {
                        success(createKeyData)
                    })
                }
            })
        }
    })
}

function updateApiKey(apiKeyId, marketplaceCustomerId, error, success) {
    console.log(`Updating API Key ${apiKeyId} in API Gateway with marketplace customer ID`);

    // update API Gateway API Key with marketplace customer id to support metering
    const params = {
        apiKey: apiKeyId,
        patchOperations: [
            {
                op: 'replace',
                path: '/customerId',
                value: marketplaceCustomerId
            }
        ]
    };
    apigateway.updateApiKey(params, function(err, data) {
        if (err) error(err);
        else     success(data)
    });
}

function updateCustomerApiKeyId(cognitoIdentityId, customerId, apiKeyId, error, success) {
    // update customer record with marketplace customer code
    const dynamoDbParams = {
      TableName: customersTable,
      Key: {
        Id: cognitoIdentityId
      },
    };
    if (customerId) {
      Object.assign(dynamoDbParams, {
        UpdateExpression: 'set #a = :x, #b = :y',
        ExpressionAttributeNames: {'#a': 'ApiKeyId', '#b': 'MarketplaceCustomerId'},
        ExpressionAttributeValues: {
          ':x': apiKeyId,
          ':y': customerId,
        }
      });
    } else {
      Object.assign(dynamoDbParams, {
        UpdateExpression: 'set #a = :x',
        ExpressionAttributeNames: {'#a': 'ApiKeyId'},
        ExpressionAttributeValues: {
          ':x': apiKeyId
        }
      });
    }

    dynamoDb.update(dynamoDbParams, (dynamoDbErr) => {
        if (dynamoDbErr) {
            error(dynamoDbErr)
        } else {
            success()
        }
    })
}

function constructApiKeyName(accessKey, error, callback) {
  getUserAttributes(accessKey, {Username: 'user', 'custom:apiClient': 'apiClient'}, error, (attrs) => {
    if (!('user' in attrs)) {
      error('Username not set');
    }
    let response = attrs['user'];
    if ('apiClient' in attrs && attrs['apiClient']) {
      response = attrs['apiClient'] + ':' + response;
    }
    callback(response);
  });
}

function getUserAttributes(accessKey, keyMap, error, callback) {
  cognitoClient.getUser({AccessToken: accessKey}, (err, data) => {
    if (err) {
      error(err);
    } else {
      let userAttrs = Object.assign({}, data.UserAttributes, {Username: data.Username});
      if (!userAttrs) {
        callback(null);
      }
      let attrs = {};
      for (let i = 0; i < userAttrs.length; i++) {
        if (!keyMap) {
          attrs[userAttrs[i].Name] = userAttrs[i].Value
        } else if (userAttrs[i].Name in keyMap) {
          attrs[keyMap[userAttrs[i].Name]] = userAttrs[i].Value;
        }
      }
      callback(attrs);
    }
  });
}

// function getUsagePlans(error, callback) {
//     const params = {
//         limit: 1000
//     }
//     apigateway.getUsagePlans(params, (err, data) => {
//         if (err) error(err)
//         else callback(data)
//     })
// }

module.exports = {
    ensureCustomerItem: ensureCustomerItem,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    createApiKey: createApiKey,
    createUsagePlanKey: createUsagePlanKey,
    deleteUsagePlanKey: deleteUsagePlanKey,
    getApiKeyForCustomer: getApiKeyForCustomer,
    getUserApiKeyId: getUserApiKeyId,
    getUsagePlansForCustomer: getUsagePlansForCustomer,
    getUsagePlanForProductCode: getUsagePlanForProductCode,
    updateCustomerMarketplaceId: updateCustomerMarketplaceId,
    getCognitoIdentityId: getCognitoIdentityId
};
