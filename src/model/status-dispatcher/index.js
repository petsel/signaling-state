/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module StatusDispatcher
//  * @typicalname Status Dispatcher
//  * /

function hasToRelease(keypath, keypathLookup) {
  return keypathLookup.has(keypath);
}

export default class StatusDispatcher {
  constructor() {
    Object.assign(this, {
      log: {
        touch: new Map(),
        put: new Map(),
        patch: new Map(),
        delete: new Map(),
      },
      trace: {
        keypath: new Set(),
        releaseId: null,
      },
    });
  }
  collect(updateType, keypath, recentValue, currentValue) {
    const { log, trace } = this;
    const { keypath: keypathLookup } = trace;

    clearTimeout(trace.releaseId);

    if (hasToRelease(keypath, keypathLookup)) {
      /**
       *  - forced release in case of e.g.
       *    updating a branch again where
       *    its previous updates have not
       *    yet been released/published.
       */
      this.releaseLogs();
    }
    keypathLookup.add(keypath);

    const value =
      (updateType === 'patch' && {
        recent: recentValue?.getDataRaw?.() ?? recentValue,
        current: currentValue,
      }) ||
      (updateType === 'delete'
        ? recentValue?.getDataRaw?.() ?? recentValue
        : currentValue);

    log[updateType].set(keypath, value);
    /**
     *  - _smooth_ auto-release of every still collected
     *    update-log as soon as no update-process blocks
     *    such a release anymore.
     */
    trace.releaseId = setTimeout(this.releaseLogs.bind(this), 0);
  }
  releaseLogs() {
    console.log({
      log: structuredClone(this.log),
    });
    this.clearLogsAndTraces();
  }
  clearLogsAndTraces() {
    const {
      log,
      trace: { keypath: keypathLookup },
    } = this;

    keypathLookup.clear();

    log.touch.clear();
    log.put.clear();
    log.patch.clear();
    log.delete.clear();
  }
}
