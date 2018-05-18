/* eslint-disable */
/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */


import apiGatewayClientFactory from './apiGatewayClient';
import {assertParametersDefined, parseParametersToObject} from "./utils";
import urlTemplate from 'url-template'

export default {
  newClient: clientConfig => {
    let apigClient = {};
    const configBase = {
      invokeUrl: '',
      accessKey: '',
      secretKey: '',
      sessionToken: '',
      region: '',
      apiKey: undefined,
      defaultContentType: 'application/json',
      defaultAcceptType: 'application/json',
    };

    let config = Object.assign({}, configBase, clientConfig);

    if (!config.invokeUrl) {
      throw {message: 'Mandatory invokeUrl not passed'};
    }
    if (!config.region) {
      throw {message: 'Mandatory region not passed'};
    }

    // extract endpoint and path from url
    const endpoint = /(^https?:\/\/[^\/]+)/g.exec(config.invokeUrl)[1];
    const pathComponent = config.invokeUrl.substring(endpoint.length);

    const sigV4ClientConfig = {
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      sessionToken: config.sessionToken,
      serviceName: 'execute-api',
      region: config.region,
      endpoint: endpoint,
      defaultContentType: config.defaultContentType,
      defaultAcceptType: config.defaultAcceptType
    };

    let authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
      authType = 'AWS_IAM';
    }

    const simpleHttpClientConfig = {
      endpoint: endpoint,
      defaultContentType: config.defaultContentType,
      defaultAcceptType: config.defaultAcceptType
    };

    const apiGatewayClient = apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);

    apigClient.rootOptions = function (params, body, additionalParams) {
      if (additionalParams === undefined) {
        additionalParams = {};
      }

      assertParametersDefined(params, [], ['body']);

      const rootOptionsRequest = {
        verb: 'options'.toUpperCase(),
        path: pathComponent + urlTemplate.parse('/').expand(parseParametersToObject(params, [])),
        headers: parseParametersToObject(params, []),
        queryParams: parseParametersToObject(params, []),
        body: body
      };

      return apiGatewayClient.makeRequest(rootOptionsRequest, authType, additionalParams, config.apiKey);
    };


    apigClient.get = function (path, params, body, additionalParams) {
      if (additionalParams === undefined) {
        additionalParams = {};
      }

      assertParametersDefined(params, [], ['body']);

      const proxyOptionsRequest = {
        verb: 'GET',
        path: pathComponent + path,
        headers: parseParametersToObject(params, []),
        queryParams: parseParametersToObject(params, ['start', 'end']),
        body: body
      };

      return apiGatewayClient.makeRequest(proxyOptionsRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.post = function (path, params, body, additionalParams) {
      if (additionalParams === undefined) {
        additionalParams = {};
      }

      assertParametersDefined(params, [], ['body']);

      const proxyOptionsRequest = {
        verb: 'POST',
        path: pathComponent + path,
        headers: parseParametersToObject(params, []),
        queryParams: parseParametersToObject(params, []),
        body: body
      };

      return apiGatewayClient.makeRequest(proxyOptionsRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.put = function (path, params, body, additionalParams) {
      if (additionalParams === undefined) {
        additionalParams = {};
      }

      assertParametersDefined(params, [], ['body']);

      const proxyOptionsRequest = {
        verb: 'PUT',
        path: pathComponent + path,
        headers: parseParametersToObject(params, []),
        queryParams: parseParametersToObject(params, []),
        body: body
      };


      return apiGatewayClient.makeRequest(proxyOptionsRequest, authType, additionalParams, config.apiKey);
    };

    apigClient.delete = function (path, params, body, additionalParams) {
      if (additionalParams === undefined) {
        additionalParams = {};
      }

      assertParametersDefined(params, [], ['body']);

      const proxyOptionsRequest = {
        verb: 'DELETE',
        path: pathComponent + path,
        headers: parseParametersToObject(params, []),
        queryParams: parseParametersToObject(params, []),
        body: body
      };

      return apiGatewayClient.makeRequest(proxyOptionsRequest, authType, additionalParams, config.apiKey);
    };

    return apigClient;
  }
};
