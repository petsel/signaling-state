// eslint-disable-next-line max-classes-per-file
import { isObject } from '../../utility';

import StateDispatcher from '../state-dispatcher';
import ListenersManager from '../listeners-manager';

/**
 * @module model
 * @typicalname Signaling State Model
 */

// /* *
//  * @module SignalingTarget
//  * @typicalname Signaling Target
//  * /

function getDataRaw(target) {
  // - some values like e.g. a deeply proxied state can not
  //   be structurally cloned, but stringified and parsed.
  return JSON.parse(JSON.stringify(target));
}
function getChildStates(target) {
  return Object.values(target).filter(value => isObject(value));
}

function isSignalingTarget(value) {
  // eslint-disable-next-line no-use-before-define
  return value instanceof SignalingObject || value instanceof SignalingArray;
}

function asSignalingTarget(
  keypath,
  rootState,
  parentState,
  stateDispatcher,
  listenersManager,
) {
  function dispatchEvent(...args) {
    // eslint-disable-next-line no-use-before-define
    return eventTarget.dispatchEvent(...args);
  }
  function addEventListener(...args) {
    // eslint-disable-next-line no-use-before-define
    return eventTarget.addEventListener(...args);
  }
  function removeEventListener(...args) {
    // eslint-disable-next-line no-use-before-define
    return eventTarget.removeEventListener(...args);
  }
  const eventTarget = new EventTarget();

  stateDispatcher = stateDispatcher ?? new StateDispatcher(this);
  listenersManager = listenersManager ?? new ListenersManager(this);

  let branchUpdateTarget = null;

  Object.defineProperties(this, {
    // eslint-disable-next-line no-underscore-dangle
    __branchUpdateTarget: {
      set: (target = null) => {
        if (
          target === null ||
          (isSignalingTarget(target) && target.getRootState() === null)
        ) {
          branchUpdateTarget = target;
        }
      },
      get: () => branchUpdateTarget,
    },
    getDataRaw: { get: () => () => getDataRaw(this) },

    getKeypath: { get: () => () => keypath },
    getRootState: { get: () => () => rootState },
    getParentState: { get: () => () => parentState },

    getChildStates: { get: () => () => getChildStates(this) },

    getStateDispatcher: { get: () => () => stateDispatcher },
    getListenersManager: { get: () => () => listenersManager },

    dispatchEvent: { get: () => dispatchEvent },
    addEventListener: { get: () => addEventListener },
    removeEventListener: { get: () => removeEventListener },
  });
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
