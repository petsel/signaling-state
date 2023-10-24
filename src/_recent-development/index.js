import { isObject } from '../utility';

/* eslint-disable no-console, no-debugger, yoda, spaced-comment */

// function computeDeletionList(entryList) {
//   return [];
// }
//
// function computeCreationList(rootPath, currentValue) {
//   return [];
// }

function getRawDataOfObservableState(state) {
  // - some values like e.g. a deeply proxied state can not
  //   be structurally cloned, but stringified and parsed.
  return JSON.parse(JSON.stringify(state));
} /*
function aggregateRawData(rawData, [key, value ]) {
  rawData[key] = isDataValue(value) ? value : recursivelyCreateRawData(value);
  return rawData;
}
function recursivelyCreateRawData(state) {
  return Object.entries(state).reduce(aggregateRawData, {});
}*/

function getPathAndKey(value) {
  const pathPartials = value.split('.');
  const key = pathPartials.splice(-1).at(0);

  return { path: pathPartials.join('.'), key };
}
function getSanitizedPath(path) {
  return path.replace(/^\./, '');
}

export default function createDeepObservableModelState(
  model,
  handleStateChange = changeLog =>
    console.log({
      changeLog,
    }),
) {
  let UNDEFINED_VALUE;

  let observerStatus = 'creation';
  let pathAtCreation = '';

  const bulkCreationList = [];

  const rawByProxy = new WeakMap();
  const pathByProxy = new WeakMap();
  const targetByProxy = new WeakMap();
  const proxyByTarget = new WeakMap();
  const proxyByPath = new Map();

  // const pathByTarget = new WeakMap;
  // const targetByPath = new Map;

  function deleteLookupEntriesByPath(path) {
    const proxy = proxyByPath.get(path);
    const target = targetByProxy.get(proxy);

    rawByProxy.delete(proxy);
    pathByProxy.delete(proxy);
    targetByProxy.delete(proxy);
    proxyByTarget.delete(target);
    proxyByPath.delete(path);
  }
  function setLookupEntries(path, proxy, target, rawData) {
    rawByProxy.set(proxy, rawData);
    pathByProxy.set(proxy, path);
    targetByProxy.set(proxy, target);
    proxyByTarget.set(target, proxy);
    proxyByPath.set(path, proxy);
  }

  function ensureEmptyDataNodeProxy(targetData, keypath, proxy) {
    if (Object.keys(targetData).length === 0) {
      const { path: parentPath, key: targetKey } = getPathAndKey(keypath);
      const parentProxy = proxyByPath.get(parentPath);

      debugger;

      if (parentProxy && targetKey !== '') {
        parentProxy[targetKey] = proxy;
      }
    }
  }

  function emptyBulkCreationList() {
    bulkCreationList.length = 0;
  }
  function createBulkListItem(keypath, value, isNode = false) {
    bulkCreationList.push({ keypath, [(isNode && 'node') || 'value']: value });
  }

  function recursivelyCreateDeepProxy(
    targetData,
    path = '',
    recursionDepth = 0,
  ) {
    // - both times outer-scope assignments and no local
    //   variables in order to avoid closure creation.
    observerStatus = 'creation';
    pathAtCreation = getSanitizedPath(path);

    console.log({
      pathAtCreation,
      recursionDepth,
    });
    const rawData = structuredClone(targetData);

    debugger;

    /* eslint-disable no-use-before-define */
    const proxy = new Proxy(targetData, {
      // get: getProperty,
      set: setProperty,
      deleteProperty,
    });
    /* eslint-enable no-use-before-define */

    setLookupEntries(pathAtCreation, proxy, targetData, rawData);

    // pathByTarget.set(targetData, pathAtCreation);
    // targetByPath.set(pathAtCreation, targetData);

    createBulkListItem(pathAtCreation, rawData, true);
    ensureEmptyDataNodeProxy(targetData, pathAtCreation, proxy);

    if (Array.isArray(targetData)) {
      targetData.forEach((item, idx) => {
        // either case triggers the `set` trap.

        if (isObject(item)) {
          proxy[idx] = recursivelyCreateDeepProxy(
            item,
            `${path}.${idx}`,
            recursionDepth + 1,
          );
          // recursivelyCreateDeepProxy(item, `${ path }[${ idx }]`, recursionDepth + 1);
        } else {
          debugger;

          createBulkListItem(getSanitizedPath(`${path}.${idx}`), item);

          proxy[idx] = item;
        }
      });
    } else {
      Object.entries(targetData).forEach(([key, value]) => {
        // either case triggers the `set` trap.

        if (isObject(value)) {
          proxy[key] = recursivelyCreateDeepProxy(
            value,
            `${path}.${key}`,
            recursionDepth + 1,
          );
        } else {
          debugger;

          createBulkListItem(getSanitizedPath(`${path}.${key}`), value);

          proxy[key] = value;
        }
      });
    }
    // observerStatus = (recursionDepth <= 0) && 'observation' || '';
    observerStatus = (recursionDepth <= 0 && 'observation') || observerStatus;

    return proxy;
  }

  // function getProperty(target, key/*, proxy */) {
  //   const value = target[key];
  //
  //   debugger;
  //   return (isObject(value) && rawByProxy.get(value)) ?? value;
  // }

  function setProperty(target, key, currentValue, proxy) {
    // const deletionList = [];
    // const creationList = [];

    if ('observation' === observerStatus) {
      debugger;

      // const targetPath = pathByTarget.get(target);
      const targetPath = pathByProxy.get(proxy);

      //const overwriteRootPath = getSanitizedPath(`${targetPath}.${key}`);
      const overwriteRootPath = `${targetPath}.${key}`;

      const deletionList = [];
      const creationList = [];

      // // circumvents the getter trap
      // let recentValue = target[key];
      //
      // if (isObject(recentValue)) {
      //   recentValue = getRawDataOfObservableState(recentValue);
      // }

      // - either does access the most recent associated raw data node
      //   or does access a primitive value via target and key, thus,
      //   not only for the former case, but for the latter one too,
      //   circumventing/bypassing a possible `get` trap.
      const rawTargetData = rawByProxy.get(proxy);
      const recentValue = rawTargetData[key];

      debugger;

      if (isObject(currentValue)) {
        // const overwriteEntryList = [...targetByPath.entries()]
        //   .filter(([key /*, value */ ]) => key.startsWith(overwriteRootPath));

        const overwriteEntryList = [...proxyByPath.entries()].filter(
          ([keypath /*, proxy */]) => keypath.startsWith(overwriteRootPath),
        );

        const overwritePathList = overwriteEntryList.map(
          ([keypath /*, proxy */]) => keypath,
        );

        overwritePathList.forEach(deleteLookupEntriesByPath);

        const overwriteValue = recursivelyCreateDeepProxy(
          currentValue,
          overwriteRootPath,
        );
        observerStatus = 'creation';
        proxy[key] = overwriteValue;
        observerStatus = 'observation';

        debugger;

        deletionList.push(
          ...overwriteEntryList.map(([keypath, recent]) => ({
            keypath,
            value: {
              recent,
            },
          })),
        );
      } else {
        deletionList.push({
          keypath: overwriteRootPath,
          value: {
            recent: recentValue,
          },
        });
        creationList.push({
          keypath: overwriteRootPath,
          value: currentValue,
        });
        debugger;
      }
      creationList.push(...bulkCreationList);

      // reset/empty `bulkCreationList`.
      emptyBulkCreationList();

      console.log({
        observerStatus,
        action: 'patch',
        target,
        node: getRawDataOfObservableState(target),
        path: targetPath,
        key,
        value: {
          changed: currentValue !== recentValue,
          current: currentValue,
          recent: recentValue,
        },
        // pathByTarget,
        // targetByPath,
        proxyByPath,
        rawByProxy,

        deletionList,
        creationList,
      });
      handleStateChange({
        action: 'patch',
        node: getRawDataOfObservableState(target),
        path: targetPath,
        key,
        value: {
          changed: currentValue !== recentValue,
          current: currentValue,
          recent: recentValue,
        },
      });
    } else if ('creation' === observerStatus) {
      if (targetByProxy.get(proxy) !== target) {
        throw new RangeError(
          'An already registered [Proxy] should always refer its [[Target]].',
        );
      }
    } else {
      throw new RangeError(
        "The observer status so far supports just two states, 'observation' and 'creation'.",
      );
    }
    console.log({
      // pathByTarget,
      // targetByPath,
      proxyByPath,
      rawByProxy,
    });
    return Reflect.set(target, key, currentValue, proxy);
  }

  function deleteProperty(target, key) {
    const hasOwnProperty = Object.hasOwn(target, key);

    if (hasOwnProperty) {
      const proxy = proxyByTarget.get(target);
      const targetPath = pathByProxy.get(proxy);
      // const targetPath = pathByTarget.get(target);

      const deletionRootPath = getSanitizedPath(`${targetPath}.${key}`);
      const deletionList = [];

      let recentValue = target[key];

      debugger;

      if (isObject(recentValue)) {
        debugger;

        recentValue = getRawDataOfObservableState(recentValue);

        // const deletionRootPath = getSanitizedPath(`${targetPath}.${key}`);

        // const deletionEntryList = [...targetByPath.entries()]
        //   .filter(([key/*, value */]) => key.startsWith(deletionRootPath));

        const deletionEntryList = [...proxyByPath.entries()].filter(
          ([keypath /*, proxy */]) => keypath.startsWith(deletionRootPath),
        );

        const deletionPathList = deletionEntryList.map(
          ([keypath /*, proxy */]) => keypath,
        );

        deletionPathList.forEach(deleteLookupEntriesByPath);

        deletionList.push(
          ...deletionEntryList.map(([keypath, recent]) => ({
            keypath,
            value: {
              recent,
            },
          })),
        );
      } else {
        deletionList.push({
          keypath: deletionRootPath,
          value: {
            recent: recentValue,
          },
        });
      }
      Reflect.deleteProperty(target, key);

      if ('observation' === observerStatus) {
        console.log({
          observerStatus,
          action: 'delete',
          target,
          node: getRawDataOfObservableState(target),
          path: targetPath,
          key,
          value: {
            changed: true,
            current: UNDEFINED_VALUE,
            recent: recentValue,
          },
          // pathByTarget,
          // targetByPath,
          proxyByPath,
          rawByProxy,

          deletionList,
        });
        handleStateChange({
          action: 'delete',
          node: getRawDataOfObservableState(target),
          path: targetPath,
          key,
          value: {
            changed: true,
            current: UNDEFINED_VALUE,
            recent: recentValue,
          },
        });
      }
    }
    console.log({
      // pathByTarget,
      // targetByPath,
      proxyByPath,
      rawByProxy,
    });
    return hasOwnProperty;
  }

  let observableState;

  if (isObject(model)) {
    // const inputData = structuredClone(model);
    const dataNode = structuredClone(model);

    observableState = recursivelyCreateDeepProxy(model);
    debugger;

    console.log({
      observerStatus,
      action: 'put',

      target: observableState,
      node: dataNode,

      // pathByTarget,
      // targetByPath,
      proxyByPath,
      rawByProxy,

      creationList: bulkCreationList,
    });
    debugger;

    // reset/empty `bulkCreationList`.
    emptyBulkCreationList();
  }
  return observableState;
}
