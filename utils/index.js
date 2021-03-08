export function isValid(resp) {
  return resp && resp.status && resp.status === 'OK' && resp.data && resp.data[0];
}

export function getFirst(resp, def = null) {
  return isValid(resp) ? resp.data[0] : def;
}

export function getData(resp, def = []) {
  return isValid(resp) ? resp.data : def;
}

export function isValidWithoutData(resp) {
  return resp && resp.status && resp.status === 'OK';
}
