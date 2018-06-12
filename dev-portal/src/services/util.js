
export function arrayToObject(array, keyCallback, valueCallback) {
  return array.reduce(toObject(keyCallback, valueCallback), {});
}

export function toObject(keyCallback, valueCallback) {
  return (obj, d) => {
    obj[keyCallback(d)] = valueCallback(d);
    return obj;
  }
}

export function isEmpty(obj) {
  for (let v in obj) {
    if (obj.hasOwnProperty(v)) {
      return false;
    }
  }
  return true;
}
