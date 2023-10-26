import { SignalingObject, SignalingArray } from './signaling-target';

// eslint-disable-next-line import/no-cycle
import setPropertyObserver from './property-observer/set';
import deletePropertyObserver from './property-observer/delete';

const { isArray } = Array;

export const proxyByTarget = new WeakMap();
export const targetByProxy = new WeakMap();

/**
 * @module SignalingStateModel
 * @typicalname Signaling State Model
 */

export function createObservableSignalingStateModel(
  data,
  keypath = '',
  rootState = null,
  parentState = null,
  stateDispatcher = null,
  listenersManager = null,
) {
  const SignalingTarget = (isArray(data) && SignalingArray) || SignalingObject;

  const targetData = new SignalingTarget(
    keypath,
    rootState,
    parentState,
    stateDispatcher,
    listenersManager,
  );
  const stateProxy = new Proxy(targetData, {
    set: setPropertyObserver,
    deleteProperty: deletePropertyObserver,
  });
  proxyByTarget.set(targetData, stateProxy);
  targetByProxy.set(stateProxy, targetData);

  return Object.assign(stateProxy, data);
}
