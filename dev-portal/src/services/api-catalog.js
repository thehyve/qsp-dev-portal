import {lookupApiGatewayClient} from './api'

let subscriptions;
let catalog;

export function loopkupCatalog() {
  if (catalog) return Promise.resolve(catalog)

  return fetchCatalog()
      .then(({data}) => {
        catalog = data;
        return data
      })
}

export function getApi(apiId) {
  return loopkupCatalog()
      .then(catalog => catalog
          .map(c => c.apis.find(a => a.id === apiId))
          .find());
}

function fetchCatalog() {
  return lookupApiGatewayClient()
      .then(client => client.get('/catalog', {}, {}, {}));
}

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

export function clearSubscriptions() {
  subscriptions = null
}

export function isSubscribed(usagePlanId) {
  return !!getSubscribedUsagePlan(usagePlanId)
}

// export function getUsagePlanApiStages(usagePlanId) {
//   const subscribedUsagePlan = getSubscribedUsagePlan(usagePlanId)
//
//   return (subscribedUsagePlan && subscribedUsagePlan.apiStages) || []
// }

export function getSubscribedUsagePlan(usagePlanId) {
  return subscriptions && subscriptions.find && subscriptions.find(s => s.id === usagePlanId)
}

export function addSubscription(usagePlanId) {
  return lookupApiGatewayClient()
      .then(client => client.put('/subscriptions/' + usagePlanId, {}, {}))
      .then(() => window.location.reload());
}

export function confirmMarketplaceSubscription(usagePlanId, token) {
  if (!usagePlanId) {
    return
  }

  return lookupApiGatewayClient()
      .then(client => client.put('/marketplace-subscriptions/' + usagePlanId, {}, {"token": token}))
}

export function unsubscribe(usagePlanId) {
  return lookupApiGatewayClient()
      .then(client => client.delete(`/subscriptions/${usagePlanId}`, {}, {}))
      .then(() => window.location.reload());
}

export function fetchUsage(usagePlanId, endDate) {
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 31);
  const start = startDate.toJSON().split('T')[0];
  const end = endDate.toJSON().split('T')[0];
  return lookupApiGatewayClient()
      .then(client => client.get('/subscriptions/' + usagePlanId + '/usage', {start, end}, {}));
}

export function mapUsageByDate(usage, usedOrRemaining) {
  const dates = {};

  Object.values(usage.items).forEach(apiKey => {
    mapApiKeyUsageByDate(apiKey, usage.startDate, usedOrRemaining).forEach(([date, value]) => {
      if (!dates[date]) {
        dates[date] = 0;
      }

      dates[date] += value;
    })
  });

  return Object.keys(dates)
      .sort()
      .map(date => [date, dates[date]])
}

function mapApiKeyUsageByDate(apiKeyUsage, startDate, usedOrRemaining) {
  const [year, month, day] = startDate.split('-');
  const apiKeyDate = new Date(year, month - 1, day);
  apiKeyDate.setHours(0, 0, 0, 0);
  const usedOrRemainingIndex = usedOrRemaining === 'used' ? 0 : 1;

  if (apiKeyUsage && !Array.isArray(apiKeyUsage[0])) {
    apiKeyUsage = [apiKeyUsage];
  }

  return apiKeyUsage.map((usage) => {
    const date = new Date();
    date.setDate(apiKeyDate.getDate());
    apiKeyDate.setDate(apiKeyDate.getDate() + 1);
    return [date, usage[usedOrRemainingIndex]]
  })
}
