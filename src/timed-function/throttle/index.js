import {
  isFunction,
  getSanitizedTarget,
  getSanitizedPositiveInteger,
} from '../utility';

const DEFAULT_THROTTLE_THRESHOLD = 200;

/**
 * Returns a function, that, as long as being invoked continuously, will trigger
 * just once after a certain parametrized millisecond amount of `threshold` time.
 * It also triggers immediately for its first time being invoked.
 * If this method's 2nd parameter - `isSuppressTrailingCall` - is truthy, the
 * returned function does not trigger any invocation that takes place within
 * the most recent `threshold` time.
 * This method's 3rd parameter - `target` - provides the object/context a
 * throttled method can act upon.
 *
 * @param threshold {Number}                optional, but grater than zero and assuming milliseconds.
 * @param isSuppressTrailingCall {Boolean}  optional
 * @param target {Object}                   optional
 *
 * @returns {Function}
 */
function throttle(threshold, isSuppressTrailingCall, target) {
  const proceed = this; // {Function} the to be throttled function type.

  // GUARD
  if (!isFunction(proceed)) {
    return proceed;
  }
  target = getSanitizedTarget(target);
  threshold =
    getSanitizedPositiveInteger(threshold) || DEFAULT_THROTTLE_THRESHOLD;

  isSuppressTrailingCall = !!isSuppressTrailingCall;

  let timeoutId, timeGap;
  let timestampRecent, timestampCurrent;
  let context;
  // let result;

  function trigger(...argsArray) {
    timestampRecent = timestampCurrent;

    proceed.apply(context, argsArray);
    // return (result = proceed.apply(context, argsArray));
  }

  function throttled(...argsArray) {
    clearTimeout(timeoutId);
    /*
     * a throttled method's target can be delegated at call time
     * but only if it was not provided already at composition time.
     */
    context = target || getSanitizedTarget(this);

    timestampCurrent = Date.now();

    if (timestampRecent) {
      timeGap = timestampCurrent - timestampRecent;

      if (isSuppressTrailingCall && timeGap >= threshold) {
        // trailing call will be suppressed.

        trigger(...argsArray);
      } else {
        /*
         * - passing the arguments directly through `setTimeout` makes e.g.
         *   a throttled event handler capable of handling the preserved
         *   event object of the actual trigger time (something which
         *   e.g. underscore's `throttle` method is not capable of).
         * - see ... [https://stackoverflow.com/questions/69809999/settimeout-not-working-for-keyup-function/69810927#69810927]
         */
        timeoutId = setTimeout(
          trigger,
          Math.max(threshold - timeGap, 0),
          ...argsArray,
        );
      }
    } else {
      // initial call.

      trigger(...argsArray);
    }
    // return result;
  }
  return throttled;
} /*

Object.defineProperty(Function.prototype, 'throttle', {
  configurable: true,
  writable: true,
  value: throttle
}); */

// provide static implementations as well.

/**
 * @module Function.timed.throttle
 * @typicalname Throttle - Timed Function
 */
export default function staticThrottle(
  proceed,
  threshold,
  isSuppressTrailingCall,
  target,
) {
  return throttle.call(proceed, threshold, isSuppressTrailingCall, target);
} /*
Object.defineProperty(Function, 'throttle', {
  configurable: true,
  writable: true,
  value: staticThrottle
}); */
