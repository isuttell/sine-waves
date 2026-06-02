var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');

function createCanvas(width, height) {
  var calls = [];
  var context = {
    calls: calls,
    lineWidth: null,
    strokeStyle: null,
    lineCap: null,
    lineJoin: null,
    beginPath: record(calls, 'beginPath'),
    clearRect: record(calls, 'clearRect'),
    lineTo: record(calls, 'lineTo'),
    moveTo: record(calls, 'moveTo'),
    restore: record(calls, 'restore'),
    rotate: record(calls, 'rotate'),
    save: record(calls, 'save'),
    stroke: record(calls, 'stroke'),
    translate: record(calls, 'translate'),
    createLinearGradient: function() {
      var stops = [];
      return {
        stops: stops,
        addColorStop: function(offset, color) {
          stops.push([offset, color]);
        }
      };
    }
  };

  var canvas = {
    clientWidth: width || 100,
    clientHeight: height || 100,
    height: 0,
    style: {},
    width: 0,
    getContext: function(type) {
      if (type !== '2d') {
        throw new Error('Unexpected canvas context: ' + type);
      }
      return context;
    }
  };

  return {
    calls: calls,
    canvas: canvas,
    context: context
  };
}

function createBrowserContext(options) {
  options = options || {};

  var listeners = [];
  var animationFrames = [];
  var context = {
    Date: Date,
    Math: Math,
    console: console,
    devicePixelRatio: options.devicePixelRatio || 1,
    clearTimeout: function() {},
    setTimeout: function() {
      return 1;
    },
    addEventListener: function(type, listener) {
      listeners.push({
        type: type,
        listener: listener
      });
    },
    requestAnimationFrame: function(callback) {
      animationFrames.push(callback);
      return animationFrames.length;
    },
    cancelAnimationFrame: function() {}
  };

  context.window = context;
  context.__listeners = listeners;
  context.__animationFrames = animationFrames;

  return context;
}

function loadBrowserGlobal(options) {
  options = options || {};

  var context = createBrowserContext(options);
  var bundlePath = path.join(__dirname, '..', '..', options.bundle || 'sine-waves.js');
  var source = fs.readFileSync(bundlePath, 'utf8');

  vm.createContext(context);
  vm.runInContext(source, context, {
    filename: bundlePath
  });

  return {
    context: context,
    SineWaves: context.SineWaves
  };
}

function loadCommonJsExport() {
  var hadWindow = Object.prototype.hasOwnProperty.call(global, 'window');
  var previousWindow = global.window;
  var bundlePath = path.join(__dirname, '..', '..', 'sine-waves.js');

  global.window = createBrowserContext();
  delete require.cache[require.resolve(bundlePath)];

  try {
    return require(bundlePath);
  } finally {
    if (hadWindow) {
      global.window = previousWindow;
    } else {
      delete global.window;
    }
  }
}

function record(calls, name) {
  return function() {
    calls.push([name].concat(Array.prototype.slice.call(arguments)));
  };
}

module.exports = {
  createCanvas: createCanvas,
  loadBrowserGlobal: loadBrowserGlobal,
  loadCommonJsExport: loadCommonJsExport
};
