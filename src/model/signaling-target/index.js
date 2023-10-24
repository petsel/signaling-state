// eslint-disable-next-line max-classes-per-file
import { isObject } from '../../utility';

import ChangeDispatcher from '../change-dispatcher';
import ListenersManager from '../listeners-manager';

/**
 * @module SignalingTarget
 * @typicalname Signaling Target
 */

function getDataRaw(target) {
  // - some values like e.g. a deeply proxied state can not
  //   be structurally cloned, but stringified and parsed.
  return JSON.parse(JSON.stringify(target));
}
function getChildStates(target) {
  return Object.values(target).filter(value => isObject(value));
}

function asSignalingTarget(
  keypath,
  rootState,
  parentState,
  changeDispatcher,
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

  changeDispatcher = changeDispatcher ?? new ChangeDispatcher(this);
  listenersManager = listenersManager ?? new ListenersManager(this);

  Object.defineProperties(this, {
    getDataRaw: { get: () => () => getDataRaw(this) },

    getKeypath: { get: () => () => keypath },
    getRootState: { get: () => () => rootState },
    getParentState: { get: () => () => parentState },

    getChildStates: { get: () => () => getChildStates(this) },

    getChangeDispatcher: { get: () => () => changeDispatcher },
    getListenersManager: { get: () => () => listenersManager },

    dispatchEvent: { get: () => dispatchEvent },
    addEventListener: { get: () => addEventListener },
    removeEventListener: { get: () => removeEventListener },
  });
}
export class SignalingTargetObject {
  constructor(...args) {
    asSignalingTarget.apply(this, args);
  } /*
  static get [Symbol.species]() {
    return Object;
  } */
}
export class SignalingTargetArray extends Array {
  constructor(...args) {
    super();
    asSignalingTarget.apply(this, args);
  } /*
  static get [Symbol.species]() {
    return Array;
  } */
}
