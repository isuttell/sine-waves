import { SineWaves } from '../src/SineWaves';

new SineWaves({
  el: document.getElementById('waves'),

  speed: 8,

  width: function() {
    return window.innerWidth;
  },

  height: function() {
    return window.innerHeight;
  },

  wavesWidth: '95%',

  ease: 'SineInOut',

  waves: [
    {
      timeModifier: 1,
      lineWidth: 3,
      amplitude: 150,
      wavelength: 200,
      segmentLength: 20
    },
    {
      timeModifier: 1,
      lineWidth: 2,
      amplitude: 150,
      wavelength: 100
    },
    {
      timeModifier: 1,
      lineWidth: 1,
      amplitude: -150,
      wavelength: 50,
      segmentLength: 10
    },
    {
      timeModifier: 1,
      lineWidth: 0.5,
      amplitude: -100,
      wavelength: 100,
      segmentLength: 10
    }
  ],

  initialize: function (){

  },

  resizeEvent: function() {
    var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0,'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5,'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1,'rgba(0, 0, 0, 0)');

    var index = -1;
    var length = this.waves.length;
      while(++index < length){
      this.waves[index].strokeStyle = gradient;
    }
  }
});
