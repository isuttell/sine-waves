describe('sine-waves.js', function() {
  var element;
  beforeEach(function() {
    element = document.createElement('canvas');
  });

  describe('constructor', function() {

    it('should be a function', function() {
      expect(SineWaves).toBeDefined();
      expect(typeof SineWaves).toBe('function');
    });

    it('should throw an error if no element is supplied', function() {
      expect(function() {
        new SineWaves();
      }).toThrow('No Canvas Selected');
    });

    it('should throw an error if no waves are specified', function() {
      expect(function() {
        new SineWaves({
          el: element
        });
      }).toThrow('No waves specified');
    });

    it('should call initialize if it is defined', function() {
      var called = false;
      var waves = new SineWaves({
        el: element,
        width: 100,
        waves: [{}, {}],
        initialize: function() {
          called = true;
        }
      });
      expect(called).toBe(true);
    });

    it('should call resizeEvent if it is defined', function() {
      var called = false;
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        resizeEvent: function() {
          called = true;
        }
      });
      expect(called).toBe(true);
    });

    it('should accept the `running` option', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        running: false
      });
      expect(waves.running).toBe(false);
    });

    it('should accept a function for width/height', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: function() {
          return 100;
        },
        height: function() {
          return 100;
        }
      });
      spyOn(waves.options, 'width').and.returnValue(100);
      spyOn(waves.options, 'height').and.returnValue(100);
      waves.updateDimensions();
      expect(waves.options.width).toHaveBeenCalled();
      expect(waves.options.height).toHaveBeenCalled();
      expect(waves.width).toBe(100);
      expect(waves.height).toBe(100);
    });

    it('should accept a number for width/height', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100
      });
      waves.updateDimensions();
      expect(waves.width).toBe(100);
      expect(waves.height).toBe(100);
      console.log(waves.wavesWidth);
    });

    it('should accept the speed option', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        speed: 100,
      });

      expect(waves.options.speed).toBe(100);
    });
  });

  describe('getPoint', function() {
    var waves;
    var waveOptions;

    beforeEach(function() {
      waves = new SineWaves({
        el: element,
        waves: [{}],
        height: 100,
        width: 100,
        ease: 'SineInOut'
      });

      waveOptions = {
        amplitude: 10,
        wavelength: 10,
        waveFn: SineWaves.prototype.Waves.sine
      };
    });

    it('should return an object with x and y', function() {
      var point = waves.getPoint(0, 10, waveOptions);
      expect(typeof point).toBe('object');
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });

    it('should calculate a point on a sine curve', function() {
      var point = waves.getPoint(0, 10, waveOptions);
      expect(point.x).toBeCloseTo(12.5);
      expect(point.y).toBeCloseTo(50.79789494324084);

      point = waves.getPoint(0, 50, waveOptions);
      expect(point.x).toBeCloseTo(52.5);
      expect(point.y).toBeCloseTo(50);

      point = waves.getPoint(0, 100, waveOptions);
      expect(point.x).toBeCloseTo(102.5);
      expect(point.y).toBeCloseTo(49.74021418899267);
    });

  });

  describe('rotation', function() {
    it('should return the radians of options.rotate', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100,
        rotate: 180
      });
      waves.update();
      expect(waves.rotation).toBe(Math.PI);
    });
  });

  describe('waveWidth and waveLeft', function() {
    it('should calculate the width and left by percentage', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100,
        wavesWidth: '80%'
      });
      waves.updateDimensions();
      expect(waves.waveWidth).toBe(80);
      expect(waves.waveLeft).toBe(10);
    });

    it('should calculate the width and left by pixels', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100,
        wavesWidth: '70px'
      });
      waves.updateDimensions();
      expect(waves.waveWidth).toBe(70);
      expect(waves.waveLeft).toBe(15);
    });

    it('should calculate the width and left by a Number', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100,
        wavesWidth: 70
      });
      waves.updateDimensions();
      expect(waves.waveWidth).toBe(70);
      expect(waves.waveLeft).toBe(15);
    });
  });
});
