import { isProtectedDataNodeKey } from '../../../utility';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module deletePropertyObserver
//  * @typicalname Delete Property Observer
//  * /

export default function deletePropertyObserver(target, key) {
  // let success = false;

  console.log({ delete: { target, key } });

  return isProtectedDataNodeKey(key)
    ? false
    : Reflect.deleteProperty(target, key);
}
