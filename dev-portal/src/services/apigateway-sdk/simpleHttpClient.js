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

import Axios from 'axios';
import {assertDefined, copy} from "./utils";

export default {
  newClient: config => {
    function buildCanonicalQueryString(queryParams) {
      //Build a properly encoded query string from a QueryParam object
      if (!queryParams) {
        return '';
      }

      let canonicalQueryString = '';
      for (let property in queryParams) {
        if (queryParams.hasOwnProperty(property)) {
          canonicalQueryString += encodeURIComponent(property) + '=' + encodeURIComponent(queryParams[property]) + '&';
        }
      }

      return canonicalQueryString.substr(0, canonicalQueryString.length - 1);
    }

    const simpleHttpClient = {};
    simpleHttpClient.endpoint = assertDefined(config.endpoint, 'endpoint');

    simpleHttpClient.makeRequest = function (request) {
      const verb = assertDefined(request.verb, 'verb');
      const path = assertDefined(request.path, 'path');
      let queryParams = copy(request.queryParams);
      if (queryParams === undefined) {
        queryParams = {};
      }
      let headers = copy(request.headers);
      if (headers === undefined) {
        headers = {};
      }

      //If the user has not specified an override for Content type the use default
      if (headers['Content-Type'] === undefined) {
        headers['Content-Type'] = config.defaultContentType;
      }

      //If the user has not specified an override for Accept type the use default
      if (headers['Accept'] === undefined) {
        headers['Accept'] = config.defaultAcceptType;
      }

      let body = copy(request.body);
      if (body === undefined) {
        body = '';
      }

      let url = config.endpoint + path;
      const queryString = buildCanonicalQueryString(queryParams);
      if (queryString) {
        url += '?' + queryString;
      }
      const simpleHttpRequest = {
        method: verb,
        url: url,
        headers: headers,
        data: body
      };
      return Axios(simpleHttpRequest);
    };
    return simpleHttpClient;
  }
};
