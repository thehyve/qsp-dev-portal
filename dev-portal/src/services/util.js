
export function arrayToObject(array, keyCallback, valueCallback) {
  return array.reduce(toObject(keyCallback, valueCallback), {});
}

export function toObject(keyCallback, valueCallback) {
  return (obj, d) => {
    obj[keyCallback(d)] = valueCallback(d);
    return obj;
  }
}
