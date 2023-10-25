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

/**
 * - see  ... [https://gist.github.com/petsel/8a39ecb7514a577c416aa72bb80b682b#file-isdeepdatastructureequality-js]
 *
 * - also ...
 * // see ... [https://stackoverflow.com/questions/71015428/how-to-get-the-intersection-of-two-sets-while-recognizing-equal-set-values-items/71016510#71016510]
 * //
 * // How to get the intersection of two sets while recognizing
 * // equal set values/items not only by reference but by their
 * // equal structures and entries too?
 *
 * // see also ... [https://stackoverflow.com/questions/76512735/javascript-check-if-arrays-within-an-array-are-the-same]
 * //
 * // Javascript - Check if arrays within an array are the same
 */
export function isDeepDataStructureEquality(a, b) {
  let isEqual = Object.is(a, b);

  if (!isEqual) {
    if (Array.isArray(a) && Array.isArray(b)) {
      isEqual =
        a.length === b.length &&
        a.every((item, idx) => isDeepDataStructureEquality(item, b[idx]));
    } else if (a && b && typeof a === 'object' && typeof b === 'object') {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);

      isEqual =
        aKeys.length === bKeys.length &&
        aKeys.every((key /* , idx, keysArray */) =>
          isDeepDataStructureEquality(a[key], b[key]),
        );
    }
  }
  return isEqual;
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
