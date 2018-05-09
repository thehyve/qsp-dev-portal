/*
 * Copyright (c) 2018 The Hyve B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const apigateway = new AWS.APIGateway();

const customersTable = 'DevPortalCustomers';
const cognitoClient = new AWS.CognitoIdentityServiceProvider();

/**
 * Get user from the database, create it and its API key otherwise.
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback user object callback, including Id, ApiKeyId and optionally MarketplaceCustomerId.
 */
function ensureUser(identity, error, callback) {
    const {cognitoIdentityId} = identity;

    // ensure user is tracked in customer table
    const params = {
      TableName: customersTable,
      Key: {
        Id: cognitoIdentityId
      }
    };
    dynamoDb.get(params, (err, data) => {
        if (err) {
          console.log(`Failed to get user ${cognitoIdentityId} from DynamoDb`, err);
          error(err)
        } else if (data.Item === undefined) {
          createApiKey(identity, error, (key) => {
            const putParams = {
              TableName: customersTable,
              Item: {
                Id: cognitoIdentityId,
                ApiKeyId: key.id
              }
            };

            dynamoDb.put(putParams, (customerErr, customerData) => {
              if (customerErr) {
                console.log(`Failed to insert user DynamoDB item for user ${cognitoIdentityId}`, customerErr);
                error(customerErr)
              } else {
                console.log(`Created new customer in ddb with id ${cognitoIdentityId}`);
                callback(customerData)
              }
            })
          });
        } else {
          console.log(`Customer exists with id ${cognitoIdentityId}`);
          callback(data.Item)
        }
    })
}

/**
 * Get the Cognito identity from a marketplace customer ID.
 * @param marketplaceCustomerId AWS Marketplace customer ID.
 * @param error string callback
 * @param callback user object callback, with Id and MarketplaceCustomerId.
 */
function getIdentityFromMarketplaceId(marketplaceCustomerId, error, callback) {
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
          console.log(`Failed to query marketplace customer ${marketplaceCustomerId}`, err);
          error(err)
        } else if (data.Items === undefined || data.Items.length === 0) {
          // no customer matching marketplaceCustomerId - this should be created during marketplace subscription redirect
          error(`No customer is registered in the developer portal for marketplace customer ID ${marketplaceCustomerId}`)
        } else {
          callback({cognitoIdentityId: data.Items[0].Id})
        }
    })
}

/**
 * Subscribe a user to a usage plan. This ensures that the user has an API key, and subscribes that
 * to the usage plan.
 * @param identity aws-serverless-express event identity
 * @param usagePlanId usage plan ID in the API Gateway
 * @param error string callback
 * @param callback api key object callback, id, name and value.
 */
function subscribe(identity, usagePlanId, error, callback) {
  ensureApiKey(identity, error, (key) => {
    console.log(`Creating usage plan key for key id ${key.id} and usagePlanId ${usagePlanId}`);

    const params = {
      keyId: key.id,
      keyType: 'API_KEY',
      usagePlanId
    };
    apigateway.createUsagePlanKey(params, (err, data) => {
      if (err) {
        console.log(`Failed to create usage plan key for user ${identity.cognitoIdentityId}, API key ${key.id} and usage plan ${usagePlanId}`, err);
        error(err);
      } else {
        callback(data)
      }
    });
  });
}

/**
 * Unsubscribe a user from usage plan. This may use ensures that the user has an API key, and subscribes that
 * to the usage plan.
 * @param identity aws-serverless-express event identity
 * @param usagePlanId usage plan ID in the API Gateway
 * @param error string callback
 * @param success no-arg callback
 */
function unsubscribe(identity, usagePlanId, error, success) {
  getApiKeyId(identity, error, (keyId) => {
    console.log(`Deleting usage plan key for key id ${keyId} and usagePlanId ${usagePlanId}`);

    const params = {
      keyId,
      usagePlanId
    };
    apigateway.deleteUsagePlanKey(params, (err) => {
      if (err) {
        console.log(`Failed to delete usage plan key for user ${identity.cognitoIdentityId}, API key ${keyId} and usage plan ${usagePlanId}`, err);
        error(err);
      } else {
        success();
      }
    });
  });
}

/**
 * Create an API key for the user in the API Gateway. Do not call directly.
 *
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback api key object callback, id, name and value.
 */
function createApiKey(identity, error, callback) {
  constructApiKeyName(identity, error, (name) => {
    const {cognitoIdentityId} = identity;

    console.log(`Creating API Key with name ${name} for user ${cognitoIdentityId}`);

    // set the name to the cognito identity ID so we can query API Key for the cognito identity
    const params = {
      description: `Dev Portal API Key for ${cognitoIdentityId}`,
      enabled: true,
      generateDistinctId: true,
      name: name
    };

    apigateway.createApiKey(params, (err, data) => {
      if (err || !data) {
        console.log(`Failed to create API key for user ${cognitoIdentityId}`, err);
        error(err)
      } else {
        callback(data);
      }
    });
  });
}

/**
 * Ensure that user has an API key and that it is stored in DynamoDB.
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback api key object callback, id, name and value.
 */
function ensureApiKey(identity, error, callback) {
  console.log(`Getting API Key for customer ${identity.cognitoIdentityId}`);

  getApiKeyId(identity, error, (keyId) => {
    if (keyId) {
      apigateway.getApiKey({apiKey: keyId, includeValue: true}, (err, data) => {
        if (data) {
          callback(data);
        } else if (err.code === 'NotFoundException') {
          console.log(`API key ${keyId} for id ${identity.cognitoIdentityId} not found`);
          createAndStoreApiKey(identity, error, callback);
        } else {
          console.log(`Failed to get API key ${keyId} for user ${identity.cognitoIdentityId}`, err);
          error(err);
        }
      });
    } else {
      createAndStoreApiKey(identity, error, callback);
    }
  });
}

/**
 * Creates an API key for a user and stores its ID in DynamoDB. Do not call directly.
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback api key object callback, id, name and value.
 */
function createAndStoreApiKey(identity, error, callback) {
  createApiKey(identity, error, (newKey) => {
    console.log(`Storing API key ${newKey.id} for user ${identity.cognitoIdentityId}`);
    const params = {
      TableName: customersTable,
      Key: {
        Id: identity.cognitoIdentityId,
      },
      UpdateExpression: 'SET ApiKeyId = :apiKeyId',
      ExpressionAttributeValues: {
        ':apiKeyId': newKey.id
      }
    };

    // update DDB customer record with new API key id
    dynamoDb.update(params, (err) => {
      if (err) {
        console.log(`Failed to store API key ${newKey.id} for user ${identity.cognitoIdentityId}`, err)
      } else {
        callback(newKey)
      }
    });
  });
}

/**
 * Get the stored API key ID of a user. This does not guarantee that the API key with that ID still exists.
 *
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback api key object callback, id, name and value.
 */
function getApiKeyId(identity, error, callback) {
  const {cognitoIdentityId} = identity;

  console.log(`Getting API Key ID for customer ${cognitoIdentityId}`);

  const params = {
    TableName: customersTable,
    Key: {
      Id: cognitoIdentityId,
    }
  };

  dynamoDb.get(params, (err, data) => {
    if (err) {
      console.log(`Cannot get API key ID from DynamoDB user ${cognitoIdentityId}`);
      error(err)
    } else if (data.Item === undefined) {
      console.log(`No API Key found for customer ${cognitoIdentityId}`);
      callback(null);
    } else {
      const keyId = data.Item.ApiKeyId;
      console.log(`Got API key ID ${keyId}`);
      callback(keyId)
    }
  });
}

/**
 * Resets the API key name using the current user attributes.
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback api key object callback, id, name and value.
 */
function resetApiKeyName(identity, error, callback) {
  ensureApiKey(identity, error, key => {
    constructApiKeyName(identity, error, name => {
      if (key.name !== name) {
        const params = {
          apiKey: key.id,
          patchOperations: [
            {
              op: 'replace',
              path: '/name',
              value: name
            }
          ]
        };
        apigateway.updateApiKey(params, err => {
          if (err) {
            console.log(`Failed to update name of API key ${key.id}`, err);
            error(err);
          } else {
            key.name = name;
            callback(key);
          }
        });
      }
    })
  });
}

/**
 * Get all usage plans that a user is subscribed to.
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback APIGateway.Types.UsagePlans callback
 */
function getUsagePlansForCustomer(identity, error, callback) {
    console.log(`Getting usage plans for customer ${identity.cognitoIdentityId}`);

    getApiKeyId(identity, error, (keyId) => {
        if (!keyId) {
            callback({data : {}})
        } else {
            const params = {
                keyId,
                limit: 1000
            };
            apigateway.getUsagePlans(params, (err, usagePlansData) => {
                if (err) {
                  console.log(`Failed to get usage plans for user ${identity.cognitoIdentityId} with API key ${keyId}`, err);
                  error(err);
                } else {
                  callback(usagePlansData)
                }
            })
        }
    })
}

/**
 * Get the user's API key usage for a usage plan. The start and end date may not be more than a year
 * apart.
 * @param identity aws-serverless-express event identity
 * @param usagePlanId API Gateway usage plan ID
 * @param startDate start date to get the usage from, string as yyyy-mm-dd, required.
 * @param endDate end date, inclusive, to get the usage to, string as yyyy-mm-dd, required.
 * @param error string callback
 * @param callback APIGateway.Types.UsagePlans callback
 */
function getUsage(identity, usagePlanId, startDate, endDate, error, callback) {
  getApiKeyId(identity, error, (keyId) => {
    if (!keyId) {
      error(`No API key stored for ${identity.cognitoIdentityId}`);
    }
    const params = {
      endDate,
      startDate,
      usagePlanId,
      keyId,
      limit: 366
    };

    apigateway.getUsage(params, (err, data) => {
      if (err) {
        console.log(`Failed to get usage for user ${identity.cognitoIdentityId} with API key ${keyId} in usage plan ${usagePlanId}`, err);
        error(err);
      } else {
        callback(data);
      }
    });
  });
}

/**
 * Get the usage plans corresponding to a AWS Marketplace product.
 * @param productCode AWS Marketplace product code string.
 * @param error string callback
 * @param callback APIGateway.Types.UsagePlan callback
 */
function getUsagePlanForProductCode(productCode, error, callback) {
    console.log(`Getting Usage Plan for product ${productCode}`);

    // do a linear scan of usage plans for name matching productCode
    const params = {
        limit: 1000
    };
    apigateway.getUsagePlans(params, function(err, data) {
        if (err) {
          console.log(`Failed to get usage plans for product code ${productCode}`, err);
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

/**
 * Update the marketplace customer ID of a user in the DynamoDB.
 * @param identity aws-serverless-express event identity
 * @param marketplaceCustomerId market place customer ID
 * @param error string callback
 * @param success no-arg callback
 */
function updateCustomerMarketplaceId(identity, marketplaceCustomerId, error, success) {
    const params = {
        TableName: customersTable,
        Key: {
          Id: identity.cognitoIdentityId
        },
        UpdateExpression: 'set MarketplaceCustomerId = :customerId',
        ExpressionAttributeValues: {
          ':customerId': marketplaceCustomerId
        }
    };

    // update DDB customer record with marketplace customer id
    // and update API Gateway API Key with marketplace customer id
    dynamoDb.update(params, (err) => {
        if (err) {
          console.log(`Failed to update marketplace customer ID ${marketplaceCustomerId} in database item for user ${identity.cognitoIdentityId}`, err);
          error(err)
        } else {
            ensureApiKey(identity, error, (key) => {
                console.log(`Got API key with ID ${key.id}`);

                updateApiKeyCustomerId(key.id, marketplaceCustomerId, error, success);
            });
        }
    })
}

/**
 * Set the marketplace customer ID in an API key. This ensures that the API key usage will be billed.
 * @param apiKeyId API key ID
 * @param marketplaceCustomerId market place customer ID
 * @param error string callback
 * @param success no-arg callback
 */
function updateApiKeyCustomerId(apiKeyId, marketplaceCustomerId, error, success) {
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
        if (err) {
          console.log(`Failed to update customerId of API key ${apiKeyId}`, err);
          error(err);
        } else {
          success(data)
        }
    });
}

/**
 * Construct a legible API key name. Do not call directly.
 * @param identity aws-serverless-express event identity
 * @param error string callback
 * @param callback string callback
 */
function constructApiKeyName(identity, error, callback) {
  getUserAttributes(identity, {Username: 'user', 'custom:apiClient': 'apiClient'}, error, (attrs) => {
    if (!attrs || !attrs.user) {
      callback(identity.cognitoIdentityId)
    }
    callback(attrs.apiClient ? `${attrs.apiClient}:${attrs.user}` : attrs.user);
  });
}

/**
 * Get the attributes of a user. This will include the 'user' attribute containing the username.
 * @param identity aws-serverless-express event identity
 * @param keyMap remaps attributes corresponding to the keys in the map to a new key that is listed in
 *        the value. Keys that are not in this map are ignored.
 *        E.g. keyMap = {a: 'a1'} will map {a: 1, b: 2} to {a1: 1}. If the keyMap is falsey, all
 *        attributes are returned as is.
 * @param error string callback
 * @param callback string callback
 */
function getUserAttributes(identity, keyMap, error, callback) {
  if (identity.cognitoUserPoolId && identity.user) {
    const params = {
      UserPoolId: identity.cognitoUserPoolId,
      Username: identity.user,
    };
    cognitoClient.adminGetUser(params, (err, data) => {
      if (err) {
        callback({user: identity.user});
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
  } else {
    callback({user: identity.user})
  }
}

/**
 * Subscribe a user to a AWS marketplace product.
 * @param identity aws-serverless-express event identity
 * @param marketplaceToken token that marketplace passes when subscribing to a new product
 * @param usagePlanId API gateway usage plan ID to subscribe to.
 * @param error string callback
 * @param callback string callback
 */
function subscribeFromMarketplace(identity, marketplaceToken, usagePlanId, error, callback) {
  const marketplace = new AWS.MarketplaceMetering();

  const params = {
    RegistrationToken: marketplaceToken
  };

  // call MMS to crack token into marketplace customer ID and product code
  marketplace.resolveCustomer(params, (err, data) => {
    if (err) {
      console.log(`Failed to resolve customer from marketplaceToken ${marketplaceToken}`, err);
      error(err)
    } else {
      // persist the marketplaceCustomerId in DDB
      // this is used when the subscription listener receives the subscribe notification
      const marketplaceCustomerId = data.CustomerIdentifier;
      updateCustomerMarketplaceId(identity, marketplaceCustomerId, error,
        () => subscribe(identity, usagePlanId, error, callback));
    }
  })
}

module.exports = {
  ensureUser,
  subscribe,
  unsubscribe,
  ensureApiKey,
  getApiKeyId,
  getUsagePlansForCustomer,
  getUsagePlanForProductCode,
  updateCustomerMarketplaceId,
  getUsage,
  resetApiKeyName,
  subscribeFromMarketplace,
  getIdentityFromMarketplaceId,
};
