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
const controller = require('common-lambda-assets/customers-controller.js');

console.log("starting listener function");

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const message = JSON.parse(event.Records[0].Sns.Message);

    const action = message.action;
    const customerId = message['customer-identifier'];
    const productCode = message['product-code'];

    switch (action) {
        case 'subscribe-success':
            subscribe(customerId, productCode, callback);
            break;
        case 'subscribe-fail':
            callback("not implemented");
            break;
        case 'unsubscribe-pending':
            callback("not implemented");
            break;
        case 'unsubscribe-complete':
            unsubscribe(customerId, productCode, callback);
            break;
        default:
            console.log("Unknown action type " + action);
            callback("Invalid action: " + action);
            break;
    }
};

function subscribe(marketplaceCustomerId, productCode, callback) {
    console.log(`Subscribing customer ${marketplaceCustomerId} to product code ${productCode}`);

    function err(err)  {
        console.log("error: " + err);
        callback(err);
    }

    // get identity id for marketplace customer id
    controller.getIdentityFromMarketplaceId(marketplaceCustomerId, err, identity => {
      console.log(`Got cognito identity ${identity.cognitoIdentityId}`);

      controller.getUsagePlanForProductCode(productCode, err, usagePlan => {
        controller.subscribe(identity, usagePlan.id, err, result => {
            callback(null, result);
        });
      });
    });
}

function unsubscribe(customerId, productCode, callback) {
    console.log(`Unsubscribing customer ${customerId} from product code ${productCode}`);

    function err(err)  {
        console.log("error: " + err);
        callback(err);
    }

    // get identity id for marketplace customer id
    controller.getIdentityFromMarketplaceId(customerId, err, identity => {
      console.log(`Got cognito identity ${identity.cognitoIdentityId}`);

      controller.getUsagePlanForProductCode(productCode, err, usagePlan => {
        controller.unsubscribe(identity, usagePlan.id, err, result => {
          callback(null, result)
        })
      })
    })
}
