import { isObject, isProtectedDataNodeKey } from '../../../utility';
import { computeCutOffKeypathEntries } from '../../update-computation';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module deletePropertyObserver
//  * @typicalname Delete Property Observer
//  * /

export default function deletePropertyObserver(target, key) {
  let success = false;

  if (!isProtectedDataNodeKey(key)) {
    const keypath = target.getKeypath();
    const statusDispatcher = target.getStatusDispatcher();

    // - updating the logs before assigning and processing
    //   an e.g. nested data structure assures a still not
    //   mutated `currentValue`.
    const recentValue = target[key];

    if (isObject(recentValue)) {
      const keypathEntries = computeCutOffKeypathEntries(
        target,
        key,
        recentValue,
      );
      keypathEntries.forEach(([cutOffPath, lostValue]) =>
        statusDispatcher.collect('delete', cutOffPath, lostValue),
      );
    } else {
      statusDispatcher.collect('delete', keypath, recentValue);
    }
    success = Reflect.deleteProperty(target, key);
  }
  return success;
}
