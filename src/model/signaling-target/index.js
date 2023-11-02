// eslint-disable-next-line max-classes-per-file
import { isObject } from '../../utility';

import StatusDispatcher from '../status-dispatcher';
import ListenersManager from '../listeners-manager';

import withProxiedWebApiEventTarget from '../event-target/web-api-event-target';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module SignalingTarget
//  * @typicalname Signaling Target
//  * /

// function isSignalingTarget(value) {
//   // eslint-disable-next-line no-use-before-define
//   return value instanceof SignalingObject || value instanceof SignalingArray;
// }

// export function isBranchOrChild(child, branch) {
//   let isChild = child === branch;
//
//   while (!isChild && child !== null) {
//     child = child.getParent();
//
//     isChild = child === branch;
//   }
//   return isChild;
// }

function getDataRaw(target) {
  // - some values like e.g. a deeply proxied state can not
  //   be structurally cloned, but stringified and parsed.
  return JSON.parse(JSON.stringify(target));
}
function getChildren(target) {
  return Object.values(target).filter(value => isObject(value));
}

function asSignalingTarget(
  keypath = '',
  targetRoot = null,
  targetParent = null,
) {
  const isRoot = targetRoot === null && targetParent === null;

  if (isRoot) {
    targetRoot = this;
  }
  const statusDispatcher =
    (isRoot && new StatusDispatcher()) || targetRoot.getStatusDispatcher();

  const listenersManager =
    (isRoot && new ListenersManager(this)) || targetRoot.getListenersManager();

  Object.defineProperties(this, {
    getDataRaw: { value: () => getDataRaw(this) },

    getKeypath: { value: () => keypath },
    getRoot: { value: () => targetRoot },
    getParent: { value: () => targetParent },

    getChildren: { value: () => getChildren(this) },

    getStatusDispatcher: { value: () => statusDispatcher },
    getListenersManager: { value: () => listenersManager },
  });
  // mixing in ... apply the function based proxied `EventTarget` behavior.
  withProxiedWebApiEventTarget.call(this);
}

export class SignalingObject {
  constructor(...args) {
    asSignalingTarget.apply(this, args);
  } /*
  static get [Symbol.species]() {
    return Object;
  } */
}
export class SignalingArray extends Array {
  constructor(...args) {
    super();
    asSignalingTarget.apply(this, args);
  } /*
  static get [Symbol.species]() {
    return Array;
  } */
}
