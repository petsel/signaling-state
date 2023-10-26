// import staticDebounce from '../../timed-function/debounce';
import { isDeepDataStructureEquality } from '../../utility';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module StateDispatcher
//  * @typicalname Change Dispatcher
//  * /

function isPutUpdate(target, key, currentValue) {
  return (
    // entirely new key-value pair.
    !Object.hasOwn(target, key) ||
    // replacement by an entirely different data-structure.
    Object
      // recent value keys.
      .keys(target[key])
      // not a single key shared by current and recent value.
      .every(recentKey => !Object.hasOwn(currentValue, recentKey))
  );
}

export function computeUpdateType(target, key, currentValue) {
  return (
    // - either entirely new key-value pair
    // - or replacement by an entirely different data-structure.
    (isPutUpdate(target, key, currentValue) && 'put') ||
    // - kind of no-op or null-patch which assigns an entirely equal value.
    (isDeepDataStructureEquality(target[key], currentValue) && 'touch') ||
    // - everything else is considered to be ... patching with a different value.
    'patch'
  );
}

function handleUpdateThroughBoundDispatcher() {
  const touchLog = structuredClone(this.touchLog);
  const putLog = structuredClone(this.putLog);
  const patchLog = structuredClone(this.patchLog);
  const deleteLog = structuredClone(this.deleteLog);

  this.clearLogs();

  console.log({ touchLog, putLog, patchLog, deleteLog });
}

export default class StateDispatcher {
  constructor(targetRoot) {
    Object.assign(this, {
      targetRoot /*
      // the async use case.
      dispatchUpdate: staticDebounce(
        handleUpdateThroughBoundDispatcher,
        50,
        false,
        this,
      ) */,
      dispatchUpdate: handleUpdateThroughBoundDispatcher.bind(this),
      touchLog: new Map(),
      putLog: new Map(),
      patchLog: new Map(),
      deleteLog: new Map(),
    });
  }
  touch(keypath, value) {
    this.touchLog.set(keypath, value);

    // // the async use case.
    // this.dispatchUpdate();
  }
  put(keypath, value) {
    this.putLog.set(keypath, value);

    // // the async use case.
    // this.dispatchUpdate();
  }
  patch(keypath, value) {
    this.patchLog.set(keypath, value);

    // // the async use case.
    // this.dispatchUpdate();
  }
  delete(keypath, value) {
    this.deleteLog.set(keypath, value);

    // // the async use case.
    // this.dispatchUpdate();
  }
  clearLogs() {
    this.touchLog.clear();
    this.putLog.clear();
    this.patchLog.clear();
    this.deleteLog.clear();
  }
}
