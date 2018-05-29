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

import {lookupApiGatewayClient} from './api'

let subscriptions;
let catalog;

/**
 * Look up the API catalog.
 * @returns {Promise} catalog, fetched or retrieved from cache.
 */
export function loopkupCatalog() {
  if (catalog) {
    return Promise.resolve(catalog);
  }

  return fetchCatalog()
      .then(({data}) => {
        catalog = data;
        return data
      })
}

/**
 * Look up single API from the catalog.
 * @param {string} apiId ID of the API to be fetched.
 * @returns {Promise} catalog, fetched or retrieved from cache.
 */
export function getApi(apiId) {
  return loopkupCatalog()
      .then(catalog => catalog
          .map(c => c.apis.find(a => a.id === apiId))  // find the api in all usage plans
          .find(api => !!api));  // return the first found api
}

function fetchCatalog() {
  return lookupApiGatewayClient()
      .then(client => client.get('/catalog', {}, {}, {}));
}

/**
 * Look up the subscriptions that the current user has. This is retrieved from the backend lambda
 * subscriptions call.
 * @returns {Promise} subscriptions, fetched or retrieved from cache.
 */
export function lookupSubscriptions() {
  if (subscriptions) {
    return Promise.resolve(subscriptions);
  }

  return fetchSubscriptions()
      .then(({data}) => {
        subscriptions = data;
        return subscriptions;
      });
}

function fetchSubscriptions() {
  if (subscriptions) {
    return Promise.resolve(subscriptions);
  }

  // get subscribed usage plans
  return lookupApiGatewayClient()
      .then(client => client.get('/subscriptions', {}, {}, {}));
}

/**
 * Clear subscriptions cache.
 */
export function clearSubscriptions() {
  subscriptions = null
}

/**
 * Whether the current user is subscribed to given usage plan.
 * @param {string} usagePlanId usage plan ID from the API Gateway.
 * @returns {boolean} whether the user is subscribed.
 */
export function isSubscribed(usagePlanId) {
  return subscriptions && subscriptions.find && subscriptions.find(s => s.id === usagePlanId)
}

/**
 * Subscribe the current user to given usage plan.
 * @param {string} usagePlanId usage plan ID from the API Gateway.
 * @returns {Promise} subscription details from backend lambda.
 */
export function addSubscription(usagePlanId) {
  return lookupApiGatewayClient()
      .then(client => client.put('/subscriptions/' + usagePlanId, {}, {}));
}

/**
 * Confirm a marketplace subscription.
 *
 * @param usagePlanId API Gateway usage plan ID.
 * @param token AWS Marketplace registration token.
 * @returns {Promise} marketplace-subscriptions from backend lambda.
 */
export function confirmMarketplaceSubscription(usagePlanId, token) {
  if (!usagePlanId) {
    return Promise.reject({message: 'No usage plan ID given.'});
  }

  return lookupApiGatewayClient()
      .then(client => client.put('/marketplace-subscriptions/' + usagePlanId, {}, {"token": token}))
}

/**
 * Unsubscribe the current user from given usage plan.
 * @param {string} usagePlanId usage plan ID from the API Gateway.
 * @returns {Promise} unsubscribe details from backend lambda.
 */
export function unsubscribe(usagePlanId) {
  return lookupApiGatewayClient()
      .then(client => client.delete(`/subscriptions/${usagePlanId}`, {}, {}));
}

/**
 * Retrieves 31 days of usage data of a usage plan for the current user.
 * @param {string} usagePlanId API Gateway usage plan ID.
 * @param {string} endDate end date of the 31 days of the format 'yyyy-mm-dd'
 * @returns {Promise} usage data from backend lambda.
 */
export function fetchUsage(usagePlanId, endDate) {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 31);
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.split('T')[0];
  return lookupApiGatewayClient()
      .then(client => client.get('/subscriptions/' + usagePlanId + '/usage', {start, end}, {}));
}

/**
 * Map usage data, retrieved with fetchUsage(), to an array with usage per date.
 * @param usage usage data from fetchUsage.
 * @returns {({date: Date, used: number, remaining: number})[]} an array of usage per date, sorted by UTC timestamp in seconds.
 */
export function mapUsageByDate(usage) {
  const usedPerDate = {};
  const remainingPerDate = {};
  Object.values(usage.items).forEach(apiKeyUsage => {
    mapApiKeyUsageByDate(apiKeyUsage, usage.startDate)
        .forEach(({date, used, remaining}) => {
          const dateString = date.toISOString();
          if (!usedPerDate[dateString]) {
            usedPerDate[dateString] = 0;
            remainingPerDate[dateString] = 0
          }
          usedPerDate[dateString] += used;
          remainingPerDate[dateString] += remaining;
        })
  });

  return Object.keys(usedPerDate)
      .sort()
      .map(dateString => ({
        date: new Date(dateString),
        used: usedPerDate[dateString],
        remaining: remainingPerDate[dateString]
      }));
}

/**
 * Maps the usage data of a single API key to an array with usage per date.
 * @param apiKeyUsage usage data of a single API key
 * @param {string} startDate date to start counting from, format 'yyyy-mm-dd'
 * @returns {({date: Date, used: number, remaining})[]} array of usage per date.
 */
function mapApiKeyUsageByDate(apiKeyUsage, startDate) {
  const apiKeyDate = new Date(startDate);

  if (apiKeyUsage && !Array.isArray(apiKeyUsage[0])) {
    apiKeyUsage = [apiKeyUsage];
  }

  return apiKeyUsage.map(([used, remaining]) => {
    const date = new Date(apiKeyDate);
    apiKeyDate.setDate(apiKeyDate.getDate() + 1);
    return {date, used, remaining};
  })
}
