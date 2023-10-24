/**
 * @module timed-function-utility
 * @typicalname Timed Function Utility
 */

export function isFunction(value) {
  return (
    typeof value === 'function' &&
    typeof value.call === 'function' &&
    typeof value.apply === 'function'
  );
}
const { isSafeInteger } = Number;

function getSanitizedInteger(number) {
  return (isSafeInteger((number = parseInt(number, 10))) && number) || 0;
}
export function getSanitizedPositiveInteger(number) {
  return Math.max(getSanitizedInteger(number), 0);
}

export function getSanitizedTarget(target) {
  return target ?? null;
}
