/**
 * @module utility
 * @typicalname Utility Helpers
 */
function getBuildInInternalSignature(value) {
  return Object.prototype.toString.call(value);
}
function getBuildInInternalTypeName(value) {
  return /^\[object\s+(?<typeName>[^\]]+)]$/.exec(
    getBuildInInternalSignature(value),
  ).groups.typeName;
}

export function isObject(value) {
  return !!value && typeof value === 'object';
}
export function isObjectObject(value) {
  return getBuildInInternalTypeName(value) === 'Object';
}

export function isDataObject(value) {
  return Array.isArray(value) || isObjectObject(value);
}
export function isDataValue(value) {
  return /^(?:string|number|boolean)$/.test(typeof value);
  // return (/^string|number|bigint|boolean|symbol$/).test(typeof value);
}

export function isEventTargetMethodName(key) {
  return /^(?:dispatchEvent|addEventListener|removeEventListener)$/.test(key);
}
export function isProtectedDataNodeProperty(key) {
  return /^(?:getDataRaw|getKeypath|getRootState|getParentState|getChildStates|getChangeDispatcher|getListenersManager)$/.test(
    key,
  );
}

export function isProtectedDataNodeKey(key) {
  return isProtectedDataNodeProperty(key) || isEventTargetMethodName(key);
}

export function isValidDataKey(key) {
  return typeof key === 'string' && !isProtectedDataNodeKey(key);
}
export function isValidDataValue(value) {
  return isDataValue(value) || isDataObject(value);
}
export function isValidDataEntry(key, value) {
  return isValidDataKey(key) && isValidDataValue(value);
}

export function concatKeypath(keypath, key) {
  return `${keypath}.${key}`;
}
export function getSanitizedPath(path) {
  return path.replace(/^\./, '');
}
