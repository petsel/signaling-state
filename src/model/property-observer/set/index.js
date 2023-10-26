import {
  isBranchValue,
  isValidDataEntry,
  concatKeypath,
  getSanitizedPath,
} from '../../../utility';

// eslint-disable-next-line import/no-cycle
import {
  createObservableSignalingStateModel,
  targetByProxy,
} from '../../index';
import { computeUpdateType } from '../../state-dispatcher';

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

  console.log({ set: { target, key, value: currentValue, proxy } });

  if (isValidDataEntry(key, currentValue)) {
    /* eslint-disable no-underscore-dangle */

    const keypath = getSanitizedPath(concatKeypath(target.getKeypath(), key));

    const rootState = target.getRootState() ?? proxy;
    const rootTarget = targetByProxy.get(rootState);

    const stateDispatcher = target.getStateDispatcher();
    const listenersManager = target.getListenersManager();

    const updateType = computeUpdateType(target, key, currentValue);

    // - updating the logs before assigning and processing
    //   an e.g. nested data structure assures a still not
    //   mutated `currentValue`.
    stateDispatcher[updateType](keypath, currentValue);

    if (isBranchValue(currentValue)) {
      if (rootTarget.__branchUpdateTarget === null) {
        // bypass the `rootState` [[Proxy]] `set` trap.
        rootTarget.__branchUpdateTarget = target;
      }
      currentValue = createObservableSignalingStateModel(
        currentValue,
        keypath,
        rootState,
        proxy,
        stateDispatcher,
        listenersManager,
      );
    }
    success = Reflect.set(target, key, currentValue, proxy);

    if (rootTarget.__branchUpdateTarget === target) {
      // bypass the `rootState` [[Proxy]] `set` trap.
      rootTarget.__branchUpdateTarget = null;
    }
    if (rootTarget.__branchUpdateTarget === null) {
      // - is going to dispatch any data updates which meanwhile,
      //   during e.g. an ongoing branch update (nested data),
      //   has been collected in any of the related update-type
      //   specific logs.
      // - does also clear any of the logs.
      stateDispatcher.dispatchUpdate();
    }
    /* eslint-enable no-underscore-dangle */
  }
  return success;
}
