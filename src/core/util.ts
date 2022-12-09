export const isObject = (value: unknown): value is Object =>
  Object.prototype.toString.call(value) === '[object Object]';

export const isArray = (value: unknown): value is Array<any> =>
  Object.prototype.toString.call(value) === '[object Array]';

export const getValue = (obj: any, path: unknown) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (typeof path === 'number') {
    return obj[path];
  }
  if (typeof path === 'string') {
    if (Object.prototype.hasOwnProperty.call(obj, path)) {
      return obj[path];
    }
    if (path.length <= 0) {
      return obj;
    }
    return path.split('.').reduce((acc, item) => (acc ? acc[item] : undefined), obj);
  }
  if (Array.isArray(path)) {
    return path.reduce((acc, item) => (acc ? acc[item] : undefined), obj);
  }
  return undefined;
};
