import { isDeepDataStructureEquality, isObject } from '../../utility';

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

function computeUpdateType(target, key, currentValue) {
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

// const x = {
//   foo: 'FOO',
//   bar: {
//     baz: {
//       biz: 'BIZ',
//       buzz: 'BUZZ',
//     }
//   },
// }
// Object.assign(x.bar, {
//   baz: 'BAZ'
// });
//
// before:
//   'foo'
//   'foo.bar'
//   'foo.bar.baz'
//   'foo.bar.baz.biz'
//   'foo.bar.baz.buzz'
//
// after:
//   'foo'
//   'foo.bar'
//   'foo.bar.baz'
//
// difference:
//   'foo.bar.baz.biz'
//   'foo.bar.baz.buzz'

function computeKeypathEntries(data = {}, keypath = '', recursionDepth = 0) {
  let entries = [];

  if (recursionDepth >= 1) {
    entries.push([keypath, data]);
  }
  if (Array.isArray(data)) {
    entries = entries.concat(
      ...data.map((item, idx) =>
        computeKeypathEntries(
          item,
          (!keypath && idx) || `${keypath}.${idx}`,
          recursionDepth + 1,
        ),
      ),
    );
  } else if (!!data && typeof data === 'object') {
    entries = entries.concat(
      ...Object.entries(data).map(([key, value]) =>
        computeKeypathEntries(
          value,
          (!keypath && key) || `${keypath}.${key}`,
          recursionDepth + 1,
        ),
      ),
    );
  }
  return entries;
}

function computeCutOffKeypathEntries(target, key, currentValue) {
  const targetPath = target.getKeypath();

  const resentKeypathEntriesMap = new Map(
    computeKeypathEntries(target[key], targetPath),
  );
  const currentKeypathEntries = computeKeypathEntries(currentValue, targetPath);

  currentKeypathEntries.forEach(([keypath /* , value */]) => {
    if (resentKeypathEntriesMap.has(keypath)) {
      resentKeypathEntriesMap.delete(keypath);
    }
  });
  return [...resentKeypathEntriesMap.entries()];
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
  collect(keypath, target, key, currentValue) {
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

    const updateType = computeUpdateType(target, key, currentValue);

    if (updateType === 'patch' && isObject(target[key])) {
      computeCutOffKeypathEntries(target, key, currentValue).forEach(
        ([cutOffPath, lostValue]) => log.delete.set(cutOffPath, lostValue),
      );
    }
    log[updateType].set(keypath, currentValue);
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
