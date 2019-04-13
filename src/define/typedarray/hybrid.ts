export var USE_TYPEDARRAY =
  (typeof Uint8Array !== 'undefined') &&
  (typeof Uint16Array !== 'undefined') &&
  (typeof Uint32Array !== 'undefined') &&
  (typeof DataView !== 'undefined');
