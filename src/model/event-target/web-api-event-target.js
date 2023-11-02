/**
 *  function-based `this`-context aware mixin
 *  which implements a forwarding proxy for a
 *  real Web-API EventTarget behavior/experience.
 */
export default function withProxiedWebApiEventTarget() {
  const observable = this;

  // the proxy.
  const eventTarget = new EventTarget();

  // the forwarding behavior.
  function removeEventListener(...args) {
    return eventTarget.removeEventListener(...args);
  }
  function addEventListener(...args) {
    return eventTarget.addEventListener(...args);
  }
  function dispatchEvent(...args) {
    return eventTarget.dispatchEvent(...args);
  }

  // apply behavior to the mixin's observable `this`.
  Object.defineProperties(observable, {
    removeEventListener: { value: removeEventListener },
    addEventListener: { value: addEventListener },
    dispatchEvent: { value: dispatchEvent },
  });

  // return observable target/type.
  return observable;
}
