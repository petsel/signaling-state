import ListenersManager from '../listeners-manager';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module StatusDispatcher
//  * @typicalname Status Dispatcher
//  * /

/**
 *  registry related code
 */
const stateRootIndex = new WeakMap();

function register(targetRoot) {
  stateRootIndex.set(
    targetRoot,
    new Map([
      // eslint-disable-next-line no-use-before-define
      ['statusDispatcher', new StatusDispatcher(targetRoot)],
      ['listenersManager', new ListenersManager(targetRoot)],
      ['targetByKeypath', new Map()],
    ]),
  );
}
function getServices(targetRoot) {
  return stateRootIndex.get(targetRoot);
}

export const stateRegistry = {
  register,
  getServices,
};

/**
 *  dispatcher related code
 */

function dispatchStatus(log, targetRoot) {
  ['delete', 'patch', 'put', 'touch'].forEach(updateType => {
    [...log[updateType].entries()].forEach(([keypath, value]) => {
      const target = stateRegistry
        .getServices(targetRoot)
        .get('targetByKeypath')
        .get(keypath);

      console.log({ target, stateRegistry });

      target.dispatchEvent(
        new CustomEvent(`data${updateType}`, {
          bubbles: true,
          cancelable: true,
          detail: {
            keypath,
            value,
          },
        }),
      );
    });
  });
}

function hasToRelease(keypath, keypathLookup) {
  return keypathLookup.has(keypath);
}

export class StatusDispatcher {
  constructor(targetRoot) {
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
      targetRoot,
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
        // recent: isObject(recentValue) && getDataRaw(recentValue) || recentValue,
        recent: recentValue?.getDataRaw?.() ?? recentValue,
        current: currentValue,
      }) ||
      (updateType === 'delete'
        ? // ? isObject(recentValue) && getDataRaw(recentValue) || recentValue
          recentValue?.getDataRaw?.() ?? recentValue
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
    dispatchStatus(this.log, this.targetRoot);

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
