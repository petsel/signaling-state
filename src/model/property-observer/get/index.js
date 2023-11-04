/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module getPropertyObserver
//  * @typicalname Get Property Observer
//  * /

export default function getPropertyObserver(target, key, proxy) {
  return key === 'dispatchEvent' ? undefined : Reflect.get(target, key, proxy);
}
