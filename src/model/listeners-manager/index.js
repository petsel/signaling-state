/**
 * @module ListenersManager
 * @typicalname Listeners Manager
 */

function registerListener(listeners, keypath, eventType, eventHandler) {
  if (!listeners.has(keypath)) {
    listeners.set(keypath, new Map());
  }
  const keypathListeners = listeners.get(keypath);

  if (!keypathListeners.has(eventType)) {
    keypathListeners.set(eventType, new Set());
  }
  const handlers = keypathListeners.get(eventType);

  if (!handlers.has(eventHandler)) {
    handlers.add(eventHandler);
  }
}
function deregisterListener(listeners, keypath, eventType, eventHandler) {
  const keypathListeners = listeners.get(keypath);

  if (keypathListeners) {
    const handlers = keypathListeners.get(eventType);

    if (handlers) {
      handlers.delete(eventHandler);

      if (handlers.size === 0) {
        keypathListeners.delete(eventType);
      }
    }
    if (keypathListeners.size === 0) {
      listeners.delete(keypath);
    }
  }
}

export default class ListenersManager {
  constructor(targetRoot) {
    Object.assign(this, {
      targetRoot,
      registry: new Map(),
    });
  }
  register(keypath, eventType, eventHandler) {
    registerListener(this.registry, keypath, eventType, eventHandler);
  }
  deregister(keypath, eventType, eventHandler) {
    deregisterListener(this.registry, keypath, eventType, eventHandler);
  }
}
