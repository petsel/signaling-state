import {
  isDataValue,
  isValidDataEntry,
  concatKeypath,
  getSanitizedPath,
} from '../../../utility';

// eslint-disable-next-line import/no-cycle
import { createObservableSignalingStateModel } from '../../../index';

/**
 * @module setPropertyObserver
 * @typicalname Set Property Observer
 */

export default function setPropertyObserver(target, key, value, proxy) {
  let success = false;

  // eslint-disable-next-line no-debugger
  debugger;
  console.log({ set: { target, key, value, proxy } });

  if (isValidDataEntry(key, value)) {
    const keypath = getSanitizedPath(concatKeypath(target.getKeypath(), key));
    const changeDispatcher = target.getChangeDispatcher();
    const listenersManager = target.getListenersManager();

    changeDispatcher.setPatchLogItem(keypath, value);

    value = isDataValue(value)
      ? value
      : createObservableSignalingStateModel(
          value,
          keypath,
          target.getRootState() || proxy,
          proxy,
          changeDispatcher,
          listenersManager,
        );
    success = Reflect.set(target, key, value, proxy);
  }
  return success;
}
