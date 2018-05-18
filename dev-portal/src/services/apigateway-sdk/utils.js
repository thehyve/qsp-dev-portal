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

export function assertDefined(object, name) {
  if (object === undefined) {
    throw new Error(name + ' must be defined');
  } else {
    return object;
  }
}

/**
 *
 * @param {object} params
 * @param {Array<string>} keys
 * @param {Array<string>} ignore
 */
export function assertParametersDefined(params, keys, ignore) {
  if (!keys) {
    return;
  }
  if (params === undefined) {
    params = {};
  }
  keys.filter(k => !contains(ignore, k))
      .forEach(key => assertDefined(params[key], key));
}

export function parseParametersToObject(params, keys) {
  if (params === undefined) {
    return {};
  }
  let object = {};
  keys.forEach(key => {
    object[key] = params[key];
  });
  return object;
}

export function contains(a, obj) {
  return a && a.find && a.find(x => x === obj) === obj;
}

export function copy(obj) {
  if (null == obj || 'object' !== typeof obj) return obj;
  let copy = obj.constructor();
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  }
  return copy;
}

export function mergeInto(baseObj, additionalProps) {
  if (null === baseObj || undefined === baseObj || 'object' !== typeof baseObj
      || !additionalProps || 'object' !== typeof additionalProps) return baseObj;
  let merged = baseObj.constructor();
  merged = Object.assign(merged, baseObj);
  return Object.assign(merged, additionalProps);
}
