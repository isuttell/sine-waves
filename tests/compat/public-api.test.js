var assert = require('node:assert/strict');
var test = require('node:test');
var helpers = require('../helpers/browser-env');

function createSubject(options) {
  var loaded = helpers.loadBrowserGlobal();
  var canvas = helpers.createCanvas();
  var subjectOptions = Object.assign({
    el: canvas.canvas,
    height: 100,
    running: false,
    waves: [{}],
    width: 100
  }, options);

  return {
    inputOptions: subjectOptions,
    SineWaves: loaded.SineWaves,
    waves: new loaded.SineWaves(subjectOptions)
  };
}

test('constructor prototype public keys stay compatible', function() {
  var SineWaves = helpers.loadBrowserGlobal().SineWaves;

  assert.deepEqual(Object.keys(SineWaves.prototype).sort(), [
    'Ease',
    'Waves',
    'clear',
    'drawWave',
    'getDimension',
    'getPoint',
    'loop',
    'options',
    'running',
    'setupUserFunctions',
    'setupWaveFns',
    'time',
    'update',
    'updateDimensions'
  ]);
});

test('constructor prototype default values stay compatible', function() {
  var SineWaves = helpers.loadBrowserGlobal().SineWaves;

  assert.deepEqual(toPlainObject(SineWaves.prototype.options), {
    ease: 'Linear',
    rotate: 0,
    speed: 10,
    wavesWidth: '95%'
  });
  assert.equal(SineWaves.prototype.running, true);
  assert.equal(SineWaves.prototype.time, 0);
});

test('public helper registries keep their named entries', function() {
  var SineWaves = helpers.loadBrowserGlobal().SineWaves;

  assert.deepEqual(Object.keys(SineWaves.prototype.Ease).sort(), [
    'linear',
    'sinein',
    'sineinout',
    'sineout'
  ]);
  assert.deepEqual(Object.keys(SineWaves.prototype.Waves).sort(), [
    'sawtooth',
    'sign',
    'sin',
    'sine',
    'square',
    'triangle'
  ]);
  assert.equal(SineWaves.prototype.Waves.sin, SineWaves.prototype.Waves.sine);
});

test('instance public keys stay compatible after construction', function() {
  var subject = createSubject();

  assert.deepEqual(Object.keys(subject.waves).sort(), [
    'ctx',
    'dpr',
    'easeFn',
    'el',
    'height',
    'options',
    'rotation',
    'running',
    'waveLeft',
    'waveWidth',
    'waves',
    'width',
    'yAxis'
  ]);
});

test('constructor keeps wave arrays public and mutates entries with waveFn', function() {
  var inputWave = {
    type: 'Square'
  };
  var subject = createSubject({
    waves: [inputWave]
  });

  assert.equal(subject.waves.waves, subject.inputOptions.waves);
  assert.equal(subject.waves.waves[0], inputWave);
  assert.equal(typeof inputWave.waveFn, 'function');
  assert.equal(inputWave.waveFn, subject.SineWaves.prototype.Waves.square);
});

test('known wave type names resolve case-insensitively', function() {
  var SineWaves = helpers.loadBrowserGlobal().SineWaves;

  assert.equal(resolveWaveFn(SineWaves, 'Sine'), SineWaves.prototype.Waves.sine);
  assert.equal(resolveWaveFn(SineWaves, 'sin'), SineWaves.prototype.Waves.sine);
  assert.equal(resolveWaveFn(SineWaves, 'Square'), SineWaves.prototype.Waves.square);
  assert.equal(resolveWaveFn(SineWaves, 'Sawtooth'), SineWaves.prototype.Waves.sawtooth);
  assert.equal(resolveWaveFn(SineWaves, 'Triangle'), SineWaves.prototype.Waves.triangle);
});

test('unknown wave and ease names fall back to existing defaults', function() {
  var subject = createSubject({
    ease: 'UnknownEase',
    waves: [{
      type: 'UnknownWave'
    }]
  });

  assert.equal(subject.waves.easeFn, subject.SineWaves.prototype.Ease.linear);
  assert.equal(subject.waves.waves[0].waveFn, subject.SineWaves.prototype.Waves.sine);
});

test('custom ease and wave functions are preserved by reference', function() {
  var customEase = function(percent, amplitude) {
    return percent * amplitude;
  };
  var customWave = function() {
    return 0;
  };
  var subject = createSubject({
    ease: customEase,
    waves: [{
      type: customWave
    }]
  });

  assert.equal(subject.waves.easeFn, customEase);
  assert.equal(subject.waves.waves[0].waveFn, customWave);
});

test('documented constructor options remain on options except el and waves', function() {
  var subject = createSubject({
    ease: 'SineIn',
    initialize: function() {},
    resizeEvent: function() {},
    rotate: 45,
    speed: 12,
    wavesWidth: '80%'
  });

  assert.deepEqual(Object.keys(subject.waves.options).sort(), [
    'ease',
    'height',
    'initialize',
    'resizeEvent',
    'rotate',
    'running',
    'speed',
    'wavesWidth',
    'width'
  ]);
  assert.equal('el' in subject.waves.options, false);
  assert.equal('waves' in subject.waves.options, false);
});

function resolveWaveFn(SineWaves, type) {
  var canvas = helpers.createCanvas();
  var subject = new SineWaves({
    el: canvas.canvas,
    height: 100,
    running: false,
    waves: [{
      type: type
    }],
    width: 100
  });

  return subject.waves[0].waveFn;
}

function toPlainObject(value) {
  return JSON.parse(JSON.stringify(value));
}
