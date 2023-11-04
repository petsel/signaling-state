import {
  isObject,
  isValidDataEntry,
  isBranchValue,
  concatKeypath,
  getSanitizedPath,
} from '../../../utility';

import {
  computeUpdateType,
  computeCutOffKeypathEntries,
} from '../../update-computation';

// eslint-disable-next-line import/no-cycle
import {
  createObservableSignalingStateModel,
  stateRegistry,
} from '../../index';

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
    const targetRoot = target.getRoot();

    const targetPath = target.getKeypath();
    const keypath = getSanitizedPath(concatKeypath(targetPath, key));

    const statusDispatcher = stateRegistry
      .get(targetRoot)
      .get('statusDispatcher');
    // const statusDispatcher = target.getStatusDispatcher();

    // const listenersManager = target.getListenersManager();

    // - updating the logs before assigning and processing
    //   an e.g. nested data structure assures a still not
    //   mutated `currentValue`.
    const recentValue = target[key];
    const updateType = computeUpdateType(target, key, currentValue);

    if (updateType === 'patch' && isObject(recentValue)) {
      const keypathEntries = computeCutOffKeypathEntries(
        target,
        key,
        currentValue,
      );
      keypathEntries.forEach(([cutOffPath, lostValue]) =>
        statusDispatcher.collect('delete', cutOffPath, lostValue),
      );
    }
    statusDispatcher.collect(updateType, keypath, recentValue, currentValue);

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
