import staticDebounce from '../../timed-function/debounce';

/**
 * @module ChangeDispatcher
 * @typicalname Change Dispatcher
 */

function handleStateChangeThroughBoundDispatcher() {
  const patchLog = structuredClone(this.patchLog);
  const deleteLog = structuredClone(this.deleteLog);

  this.clearLogs();

  console.log({ patchLog, deleteLog });
}

export default class ChangeDispatcher {
  constructor(targetRoot) {
    Object.assign(this, {
      targetRoot,
      dispatchStateChange: staticDebounce(
        handleStateChangeThroughBoundDispatcher,
        50,
        false,
        this,
      ),
      putLog: new Map(),
      patchLog: new Map(),
      deleteLog: new Map(),
    });
  }
  setPutLogItem(keypath, value) {
    this.putLog.set(keypath, value);

    this.dispatchStateChange();
  }
  setPatchLogItem(keypath, value) {
    this.patchLog.set(keypath, value);

    this.dispatchStateChange();
  }
  setDeleteLogItem(keypath, value) {
    this.deleteLog.set(keypath, value);

    this.dispatchStateChange();
  }
  clearLogs() {
    this.putLog.clear();
    this.patchLog.clear();
    this.deleteLog.clear();
  }
}
