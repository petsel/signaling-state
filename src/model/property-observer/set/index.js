import {
  isDataValue,
  isValidDataEntry,
  concatKeypath,
  getSanitizedPath,
} from '../../../utility';

// eslint-disable-next-line import/no-cycle
import { createObservableSignalingStateModel } from '../../../index';
import { computeAssignmentType } from '../../state-dispatcher';

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
    const keypath = getSanitizedPath(concatKeypath(target.getKeypath(), key));

    const stateDispatcher = target.getStateDispatcher();
    const listenersManager = target.getListenersManager();

    const assignmentType = computeAssignmentType(target, key, currentValue);

    stateDispatcher[assignmentType](keypath, currentValue);

    currentValue = isDataValue(currentValue)
      ? currentValue
      : createObservableSignalingStateModel(
          currentValue,
          keypath,
          target.getRootState() || proxy,
          proxy,
          stateDispatcher,
          listenersManager,
        );
    success = Reflect.set(target, key, currentValue, proxy);
  }
  return success;
}
