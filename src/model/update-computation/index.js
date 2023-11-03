import { isDeepDataStructureEquality } from '../../utility';

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

export function computeCutOffKeypathEntries(target, key, currentValue) {
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
