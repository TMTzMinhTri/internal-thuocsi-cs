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

export const cleanObj = (obj) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      // eslint-disable-next-line no-param-reassign
      delete obj[propName];
    }
  }
  return obj;
};

export const convertObjectToParameter = (params) => {
  if (params == null) return '';

  return new URLSearchParams(cleanObj(params)).toString();
};

export { default as ReasonUtils } from './ReasonUtils';
