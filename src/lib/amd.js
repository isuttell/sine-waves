(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && typeof define.amd === 'object') {
    define([], function() {
      return factory(root);
    });
  } else {
    root.SineWaves = factory(root);
  }
})(this, function() {
  'use strict';
