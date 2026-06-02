var assert = require('node:assert/strict');
var test = require('node:test');
var packageJson = require('../../package.json');
var helpers = require('../helpers/browser-env');

function closeTo(actual, expected) {
  assert.ok(
    Math.abs(actual - expected) < 0.0000001,
    'Expected ' + actual + ' to be close to ' + expected
  );
}

function createSubject(options, envOptions) {
  var loaded = helpers.loadBrowserGlobal(envOptions);
  var canvas = helpers.createCanvas();
  var subjectOptions = Object.assign({
    el: canvas.canvas,
    height: 100,
    running: false,
    waves: [{}],
    width: 100
  }, options);

  return {
    canvas: canvas.canvas,
    calls: canvas.calls,
    context: canvas.context,
    SineWaves: loaded.SineWaves,
    waves: new loaded.SineWaves(subjectOptions),
    window: loaded.context
  };
}

test('package entry point stays on the built browser artifact', function() {
  assert.equal(packageJson.main, 'sine-waves.js');
});

test('built artifact exposes the browser global and CommonJS wrapper shape', function() {
  var loaded = helpers.loadBrowserGlobal();
  var exported = helpers.loadCommonJsExport();

  assert.equal(typeof loaded.SineWaves, 'function');
  assert.equal(loaded.context.window.SineWaves, loaded.SineWaves);
  assert.equal(typeof exported.SineWaves, 'function');
});

test('minified artifact exposes the browser global', function() {
  var loaded = helpers.loadBrowserGlobal({
    bundle: 'sine-waves.min.js'
  });

  assert.equal(typeof loaded.SineWaves, 'function');
});

test('constructor keeps existing guard errors', function() {
  var SineWaves = helpers.loadBrowserGlobal().SineWaves;
  var canvas = helpers.createCanvas().canvas;

  assertThrowsValue(function() {
    new SineWaves();
  }, 'No Canvas Selected');

  assertThrowsValue(function() {
    new SineWaves({
      el: canvas
    });
  }, 'No waves specified');
});

test('constructor calls user hooks and honors the running option', function() {
  var initialized = 0;
  var resized = 0;
  var subject = createSubject({
    initialize: function() {
      initialized += 1;
    },
    resizeEvent: function() {
      resized += 1;
    }
  });

  assert.equal(initialized, 1);
  assert.equal(resized, 1);
  assert.equal(subject.waves.running, false);
  assert.equal(subject.window.__animationFrames.length, 1);
});

test('dimensions, DPR scaling, and wave width calculations stay compatible', function() {
  var subject = createSubject({
    height: 80,
    wavesWidth: '80%',
    width: 100
  }, {
    devicePixelRatio: 2
  });

  assert.equal(subject.waves.width, 200);
  assert.equal(subject.waves.height, 160);
  assert.equal(subject.canvas.width, 200);
  assert.equal(subject.canvas.height, 160);
  assert.equal(subject.canvas.style.width, '100px');
  assert.equal(subject.canvas.style.height, '80px');
  assert.equal(subject.waves.waveWidth, 160);
  assert.equal(subject.waves.waveLeft, 20);
  assert.equal(subject.waves.yAxis, 80);
});

test('numeric, pixel, percentage, and functional dimensions are accepted', function() {
  assert.equal(createSubject({ wavesWidth: 70 }).waves.waveLeft, 15);
  assert.equal(createSubject({ wavesWidth: '70px' }).waves.waveLeft, 15);
  assert.equal(createSubject({ wavesWidth: '70%' }).waves.waveLeft, 15);

  var subject = createSubject({
    height: function() {
      return 60;
    },
    width: function() {
      return 120;
    }
  });

  assert.equal(subject.waves.width, 120);
  assert.equal(subject.waves.height, 60);
});

test('getPoint preserves current coordinate calculations', function() {
  var subject = createSubject({
    ease: 'SineInOut'
  });
  var waveOptions = {
    amplitude: 10,
    wavelength: 10,
    waveFn: subject.SineWaves.prototype.Waves.sine
  };

  var point = subject.waves.getPoint(0, 10, waveOptions);
  closeTo(point.x, 12.5);
  closeTo(point.y, 50.79789494324084);

  point = subject.waves.getPoint(0, 50, waveOptions);
  closeTo(point.x, 52.5);
  closeTo(point.y, 50);

  point = subject.waves.getPoint(0, 100, waveOptions);
  closeTo(point.x, 102.5);
  closeTo(point.y, 49.74021418899267);
});

test('update draws configured waves with the current canvas contract', function() {
  var subject = createSubject({
    waves: [{
      lineWidth: 3,
      segmentLength: 50,
      strokeStyle: 'red'
    }]
  });

  subject.waves.update(0);

  assert.equal(subject.context.lineWidth, 3);
  assert.equal(subject.context.strokeStyle, 'red');
  assert.deepEqual(subject.calls[0], ['clearRect', 0, 0, 100, 100]);
  assert.ok(subject.calls.some(function(call) {
    return call[0] === 'beginPath';
  }));
  assert.ok(subject.calls.some(function(call) {
    return call[0] === 'stroke';
  }));
});

test('public wave and easing helper functions remain available', function() {
  var SineWaves = helpers.loadBrowserGlobal().SineWaves;
  var Waves = SineWaves.prototype.Waves;
  var Ease = SineWaves.prototype.Ease;

  assert.equal(Waves.sine, Waves.sin);
  closeTo(Waves.sine(Math.PI / 2), 1);
  assert.equal(Waves.square(0.25), 1);
  closeTo(Waves.sawtooth(0.25), 0.5);
  closeTo(Waves.triangle(0.25), 0.5);
  assert.equal(Ease.linear(0.5, 10), 10);
  closeTo(Ease.sineinout(0.5, 10), 10);
});

test('custom wave functions receive the public wave helpers', function() {
  var customCalls = [];
  var subject = createSubject({
    waves: [{
      segmentLength: 50,
      type: function(x, helpers) {
        customCalls.push([x, helpers]);
        return 0;
      }
    }]
  });

  subject.waves.update(0);

  assert.ok(customCalls.length > 0);
  assert.equal(customCalls[0][1], subject.SineWaves.prototype.Waves);
});

function assertThrowsValue(fn, expected) {
  var thrown;

  try {
    fn();
  } catch (error) {
    thrown = error;
  }

  assert.equal(thrown, expected);
}
