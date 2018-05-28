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

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const util = require('util');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const catalog = require('./catalog');
const customersController = require('common-lambda-assets/customers-controller.js');

/**
 * @typedef {Object} Express
 * @property get
 * @property post
 * @property delete
 * @property use
 */
/**
 *
 * @type {Express}
 */
const app = express();

// replace these to match your site URL. Note: Use TLS, not plain HTTP, for your production site!
const domain = `${process.env.CLIENT_BUCKET_NAME}.s3-website.${process.env.AWS_DEFAULT_REGION}.amazonaws.com`;
const baseUrl = `http://${domain}/`;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());

// authorization is handled in the CloudFormation API gateway definition.

app.post('/signin', (req, res) => {
  customersController.ensureUser(getIdentity(req), error(res), success(res));
});

// no auth
// the API catalog could be statically defined (catalog/index.js), or generated from API Gateway Usage Plans (See getUsagePlans())
app.get('/catalog', (req, res) => {
    res.status(200).json(catalog)
});

app.get('/apikey', (req, res) => {
  customersController.ensureApiKey(getIdentity(req), error(res), ({id, name, value}) => {
    res.status(200).json({id, name, value});
  });
});

app.post('/apikey/reset-name', (req, res) => {
  customersController.resetApiKeyName(getIdentity(req), error(res), ({id, name, value}) => {
    res.status(200).json({id, name, value});
  });
});


app.get('/subscriptions', (req, res) => {
  console.log(`GET /subscriptions`);

  customersController.getUsagePlansForCustomer(getIdentity(req), error(res), (data) => {
      res.status(200).json(data.items)
  });
});

app.put('/subscriptions/:usagePlanId', (req, res) => {
  const usagePlanId = req.params.usagePlanId;

  if (getUsagePlanFromCatalog(usagePlanId)) {
    customersController.subscribe(getIdentity(req), usagePlanId, error(res),
        (data) => res.status(201).json(data));
  } else {
    res.status(404).json('Invalid Usage Plan ID')
  }
});

app.get('/subscriptions/:usagePlanId/usage', (req, res) => {
  const usagePlanId = req.params.usagePlanId;

  // could error here if customer is not subscribed to usage plan, or save an extra request by just showing 0 usage
  if (getUsagePlanFromCatalog(usagePlanId)) {
    customersController.getUsage(getIdentity(req), usagePlanId, req.query.start, req.query.end,
      error(res), success(res));
  } else {
    res.status(404).json('Invalid Usage Plan ID')
  }
});

app.delete('/subscriptions/:usagePlanId', (req, res) => {
  const usagePlanId = req.params.usagePlanId;

  if (getUsagePlanFromCatalog(usagePlanId)) {
    customersController.unsubscribe(getIdentity(req), usagePlanId, error(res), () => res.status(204).send());
  } else {
    res.status(404).json('Invalid Usage Plan ID')
  }
});

// no auth
// this is the redirect URL for AWS Marketplace products
// i.e. https://YOUR_API_GATEWAY_API_ID.execute-api.us-east-1.amazonaws.com/prod/marketplace-confirm/[USAGE_PLAN_ID]
app.post('/marketplace-confirm/:usagePlanId', (req, res) => {
    const marketplaceToken = req.body['x-amzn-marketplace-token'];

    if (!marketplaceToken) {
        console.log(`Couldn't find marketplace token. Event: ${util.inspect(req.apiGateway.event, { depth: null, colors: true })}`);
        res.status(400).json({ message: 'Missing AWS Marketplace token' })
    }

    console.log(`Marketplace token: ${marketplaceToken}`);
    const usagePlanId = req.params.usagePlanId;

    // WARNING: the redirect URL should be HTTPS as the token is subject to MITM attacks over HTTP. Token expires after 60min
    // ideally this should be saved in a secure manner (i.e. DDB) until the subscription completes
    const confirmUrl = `${baseUrl}?usagePlanId=${usagePlanId}&token=${marketplaceToken}`;

    // redirect to the registration/login page
    res.redirect(302, confirmUrl)
});

app.put('/marketplace-subscriptions/:usagePlanId', (req, res) => {
  const marketplaceToken = req.body.token;
  const usagePlanId = req.params.usagePlanId;
  console.log(`Marketplace token: ${marketplaceToken}, usage plan id: ${usagePlanId}, cognito ID: ${identity.cognitoIdentityId} `);

  customersController.subscribeFromMarketplace(getIdentity(req), marketplaceToken, usagePlanId, error(res), success(res));
});

/** Get the identity provided by API Gateway. See scripts/api-gateway-event.json for an example. */
function getIdentity(req) {
  return req.apiGateway.event.requestContext.identity;
}

function getUsagePlanFromCatalog(usagePlanId) {
  return catalog.find(c => c.id === usagePlanId)
}

function error(res) {
  return (data) => {
    console.log(`error: ${data}`);
    res.status(500).json({message: data})
  };
}

function success(res) {
  return (data) => res.status(200).json(data);
}

// The aws-serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)

// Export your express server so you can import it in the lambda function.
module.exports = app;
