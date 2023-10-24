import {
  isFunction,
  getSanitizedTarget,
  getSanitizedPositiveInteger,
} from '../utility';

const DEFAULT_DEBOUNCE_DELAY = 100;

/**
 * @module timed-function
 * @typicalname Timed Function
 */

// /* *
//  * @module debounce
//  * @typicalname Debounced Function
//  * /

/**
 * Returns a function, that does not trigger, as long as being invoked continuously.
 * It does trigger immediately after not having been called for a `delay` of a
 * parametrized amount of milliseconds.
 * If this method's 2nd parameter - `isTriggerImmediately` - is truthy, the
 * returned function triggers at a `delay`'s entry point instead of its end.
 * This method's 3rd parameter - `target` - provides the object/context a
 * debounced method can act upon.
 *
 * @param delay {Number}                  optional, but grater than zero and assuming milliseconds.
 * @param isTriggerImmediately {Boolean}  optional
 * @param target {Object}                 optional
 *
 * @returns {Function}
 */
function debounce(delay, isTriggerImmediately, target) {
  const proceed = this; // {Function} the to be debounced function type.

  // GUARD
  if (!isFunction(proceed)) {
    return proceed;
  }
  target = getSanitizedTarget(target);
  delay = getSanitizedPositiveInteger(delay) || DEFAULT_DEBOUNCE_DELAY;

  isTriggerImmediately = !!isTriggerImmediately;

  let timeoutResetId, timeoutId;
  let context;
  // let result;

  function resetTimeoutId() {
    timeoutId = null;
  }

  function debounceTrigger(...argsArray) {
    resetTimeoutId();

    proceed.apply(context, argsArray);
    // return (result = proceed.apply(context, argsArray));
  }
  function immediateTrigger(...argsArray) {
    // does prevent double triggering (both leading and trailing).
    timeoutResetId = setTimeout(resetTimeoutId, delay);

    proceed.apply(context, argsArray);
    // return (result = proceed.apply(context, argsArray));
  }
  resetTimeoutId();

  function debounced(...argsArray) {
    /*
     * a debounced method's target can be delegated at call time
     * but only if it was not provided already at composition time.
     */
    context = target || getSanitizedTarget(this);

    /*
     * passing the arguments directly through `setTimeout` makes e.g.
     * a debounced event handler capable of handling the preserved
     * event object of the actual trigger time (something which
     * e.g. underscore's `debounce` method is not capable of).
     */
    if (timeoutId) {
      // does support the clean implementation of double triggering prevention.
      clearTimeout(timeoutResetId);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(debounceTrigger, delay, ...argsArray);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (isTriggerImmediately) {
        // going to prevent double triggering (both leading and trailing).
        timeoutId = setTimeout(immediateTrigger, 0, ...argsArray);
      } else {
        timeoutId = setTimeout(debounceTrigger, delay, ...argsArray);
      }
    }
    // return result;
  }
  return debounced;
} /*

Object.defineProperty(Function.prototype, 'debounce', {
  configurable: true,
  writable: true,
  value: debounce
}); */

// provide static implementations as well.

export default function staticDebounce(
  proceed,
  delay,
  isTriggerImmediately,
  target,
) {
  return debounce.call(proceed, delay, isTriggerImmediately, target);
} /*
Object.defineProperty(Function, 'debounce', {
  configurable: true,
  writable: true,
  value: staticDebounce
}); */
