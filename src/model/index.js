import { SignalingObject, SignalingArray } from './signaling-target';

// eslint-disable-next-line import/no-cycle
import setPropertyObserver from './property-observer/set';
import getPropertyObserver from './property-observer/get';
import deletePropertyObserver from './property-observer/delete';

// export const proxyByTarget = new WeakMap();
// export const targetByProxy = new WeakMap();

/**
 * @module SignalingStateModel
 * @typicalname Signaling State Model
 */

export function createObservableSignalingStateModel(
  data,
  keypath = '',
  targetRoot = null,
  targetParent = null,
) {
  const SignalingTarget =
    (Array.isArray(data) && SignalingArray) || SignalingObject;

  const dataTarget = new SignalingTarget(keypath, targetRoot, targetParent);
  const stateProxy = new Proxy(dataTarget, {
    deleteProperty: deletePropertyObserver,
    set: setPropertyObserver,
    get: getPropertyObserver,
  });
  // proxyByTarget.set(dataTarget, stateProxy);
  // targetByProxy.set(stateProxy, dataTarget);

  return Object.assign(stateProxy, data);
}
