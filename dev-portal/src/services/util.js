
export function arrayToObject(array, keyCallback, valueCallback) {
  return array.reduce((obj, d) => {
    obj[keyCallback(d)] = valueCallback(d);
    return obj;
  }, {});
}
