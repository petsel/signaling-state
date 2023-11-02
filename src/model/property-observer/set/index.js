import {
  isBranchValue,
  isValidDataEntry,
  concatKeypath,
  getSanitizedPath,
} from '../../../utility';

// eslint-disable-next-line import/no-cycle
import { createObservableSignalingStateModel } from '../../index';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module setPropertyObserver
//  * @typicalname Set Property Observer
//  * /

export default function setPropertyObserver(target, key, currentValue, proxy) {
  let success = false;

  if (isValidDataEntry(key, currentValue)) {
    const targetPath = target.getKeypath();
    const keypath = getSanitizedPath(concatKeypath(targetPath, key));

    const statusDispatcher = target.getStatusDispatcher();
    // const listenersManager = target.getListenersManager();

    // - updating the logs before assigning and processing
    //   an e.g. nested data structure assures a still not
    //   mutated `currentValue`.
    statusDispatcher.collect(keypath, target, key, currentValue);

    if (isBranchValue(currentValue)) {
      currentValue = createObservableSignalingStateModel(
        currentValue,
        keypath,
        target.getRoot(),
        target,
      );
    }
    success = Reflect.set(target, key, currentValue, proxy);
  }
  return success;
}
