/**
 *
 * User:
 * I'm looking for a one word or two word name which describes best ...
 *
 * ... a data-model where one can subscribe to state changes of the data.
 *
 * ChatGPT:
 * Certainly, you might consider using one of the following:
 *
 * StateTrack
 * DataPulse
 * WatchModel
 * ShiftSense
 * SubState
 *
 * Feel free to choose the one that resonates best with the nature and
 * purpose of your data-model.
 *
 *
 * User:
 * What do you associate with the artificial words DataSignal or DataSignals?
 *
 * ChatGPT:
 * The terms "DataSignal" and "DataSignals" evoke associations with the
 * transmission or propagation of data in a systematic or rhythmic manner.
 * This might suggest a system where data is communicated or transferred
 * in a structured way, potentially indicating a reliable and consistent
 * flow of information. The term could imply a method or mechanism for
 * conveying data points, perhaps suggesting a signaling system within
 * a broader data framework.
 *
 *
 * User:
 * From what you proposed before what would you yourself associate
 * with the word SubState?
 *
 * ChatGPT:
 * The term "SubState" suggests the concept of subscribing to a
 * particular state within a system. It might imply a more granular
 * or specific level of engagement with the state of data, indicating
 * a subset or subcategory within a larger data structure.
 * Additionally, it could hint at the ability to monitor or receive
 * updates on a particular subset of data or a specific aspect of
 * a broader data model.
 *
 * User:
 * And from another word you did propose before, what would you
 * yourself associate with the word DataPulse?
 *
 * ChatGPT:
 * The term "DataPulse" conveys the idea of regular or rhythmic bursts
 * of data, suggesting a continuous and periodic flow of information.
 * It might imply a dynamic and active monitoring or tracking system
 * where data is transmitted or updated at regular intervals, akin to
 * the beating of a pulse. This term could signify a mechanism that
 * provides timely and recurrent updates about the status or changes
 * within a data model, potentially highlighting the vitality and
 * liveliness of the data being processed.
 *
 *
 *   // OSM - Observable State Model
 *   // SSM - Signaling State Model
 *   // SDM - Signaling Data Model
 *   // SDS - Signaling Data State
 *
 * User:
 * From all the discusses terms which describe a system consisting
 * of linked data-nodes where each data-node' state can be changed
 * and where each data-node would actively notify about its state
 * change, which is your favorite term and abbreviation?
 *
 * ChatGPT:
 * Considering the context of a system with linked data-nodes
 * that actively notify about state changes, my preferred term
 * and abbreviation would be "SSM" - "Signaling State Model."
 *
 * This term effectively captures the essence of the system,
 * emphasizing the signaling mechanism and the management of
 * the state of the data-nodes. "SSM" is concise, memorable,
 * and aligns closely with the core functionalities of the
 * described system.
 *
 */
import { isDataObject } from './utility';
import { SignalingObject, SignalingArray } from './model/signaling-target';

// eslint-disable-next-line import/no-cycle
import setPropertyObserver from './model/property-observer/set';
import deletePropertyObserver from './model/property-observer/delete';

const { isArray } = Array;

const proxyByTarget = new WeakMap();

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

  return Object.assign(stateProxy, data);
}

export function createSignalingState(data) {
  return (
    (isDataObject(data) && createObservableSignalingStateModel(data)) || data
  );
}
