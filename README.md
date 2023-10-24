# Proxy-based, deep observable state-model of signaling data-nodes

Another attempt of implementing observable and signaling state.

The main features of this one are ...

 - direct manipulation of deep observable data-structures
   like assigning to or deleting from an observable state
   without the help of additional setter/getter functionality.

 - signaling/dispatching of following event-types ...
   `put`, `patch`, `delete` and of cause `statechange`.

 - `EventTarget` functionality at each signaling/dispatching
    data-node throughout the entire »Signaling State Model«.
