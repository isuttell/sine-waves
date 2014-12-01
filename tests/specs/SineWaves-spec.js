describe('sine-waves.js', function() {
  var element;
  beforeEach(function() {
    element = document.createElement('canvas');
  })

  describe('constructor', function() {

    it('should be a function', function() {
      expect(SineWaves).toBeDefined();
      expect(typeof SineWaves).toBe('function');
    });

    it('should throw an error if no element is supplied', function (){
      expect(function(){
        new SineWaves({});
      }).toThrow('No Canvas Selected');
    });

    it('should throw an error if no waves are specified', function (){
      expect(function(){
        new SineWaves({
          el: element
        });
      }).toThrow('No waves specified');
    });

    it('should call initialize if it is defined', function (){
      var called = false;
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        initialize: function() {
          called = true;
        }
      });
      expect(called).toBe(true);
    });

    it('should call resizeEvent if it is defined', function (){
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

    it('should accept a function for width/height', function (){
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: function () {
          return 100;
        },
        height: function () {
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

    it('should accept a number for width/height', function (){
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100
      });
      waves.updateDimensions();
      expect(waves.width).toBe(100);
      expect(waves.height).toBe(100);
    });


    it('should accept the speed option', function() {
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        speed: 100,
      });

      expect(waves.speed).toBe(100);
    });
  });

  describe('getPoint', function() {
    var waves, waveOptions;
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
        wavelength: 10
      };
    });

    it('should return an object with x and y', function(){
      var point = waves.getPoint(0, 10, waveOptions);
      expect(typeof point).toBe('object');
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });


    it('should calculate a point on a sine curve', function(){
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

  describe('Ease.Linear', function() {
    it('should ease a value from left to right', function () {
      expect(SineWaves.prototype.Ease['Linear'](0, 100)).toBeCloseTo(100);
      expect(SineWaves.prototype.Ease['Linear'](0.25, 100)).toBeCloseTo(100);
      expect(SineWaves.prototype.Ease['Linear'](0.5, 100)).toBeCloseTo(100);
      expect(SineWaves.prototype.Ease['Linear'](0.75, 100)).toBeCloseTo(100);
      expect(SineWaves.prototype.Ease['Linear'](1, 100)).toBeCloseTo(100);
    });
  });

  describe('Ease.SineInOut', function() {
    it('should ease a value from left to right', function () {
      expect(SineWaves.prototype.Ease['SineInOut'](0, 100)).toBeCloseTo(0);
      expect(SineWaves.prototype.Ease['SineInOut'](0.25, 100)).toBeCloseTo(50);
      expect(SineWaves.prototype.Ease['SineInOut'](0.5, 100)).toBeCloseTo(100);
      expect(SineWaves.prototype.Ease['SineInOut'](0.75, 100)).toBeCloseTo(50);
      expect(SineWaves.prototype.Ease['SineInOut'](1, 100)).toBeCloseTo(0);
    });
  });

  describe('Ease.SineIn', function() {
    it('should ease a value from left to right', function () {
      expect(SineWaves.prototype.Ease['SineIn'](0, 100)).toBeCloseTo(0);
      expect(SineWaves.prototype.Ease['SineIn'](0.25, 100)).toBeCloseTo(14.644660940672626);
      expect(SineWaves.prototype.Ease['SineIn'](0.5, 100)).toBeCloseTo(50);
      expect(SineWaves.prototype.Ease['SineIn'](0.75, 100)).toBeCloseTo(85.35533905932738);
      expect(SineWaves.prototype.Ease['SineIn'](1, 100)).toBeCloseTo(100);
    });
  });

  describe('Ease.SineOut', function() {
    it('should ease a value from left to right', function () {
      expect(SineWaves.prototype.Ease['SineOut'](0, 100)).toBeCloseTo(100);
      expect(SineWaves.prototype.Ease['SineOut'](0.25, 100)).toBeCloseTo(85.35533905932738);
      expect(SineWaves.prototype.Ease['SineOut'](0.5, 100)).toBeCloseTo(50);
      expect(SineWaves.prototype.Ease['SineOut'](0.75, 100)).toBeCloseTo(14.644660940672626);
      expect(SineWaves.prototype.Ease['SineOut'](1, 100)).toBeCloseTo(0);
    });
  });

  describe('getEaseFn', function() {
    it('should return a function if passed a function', function() {
      var expectedFn = function(){};
      expect( SineWaves.prototype.getEaseFn(expectedFn) ).toBe(expectedFn);
    });

    it('should return a function if passed a ease function name', function() {
      expect(SineWaves.prototype.getEaseFn('Linear')).toBe(SineWaves.prototype.Ease.Linear);
      expect(SineWaves.prototype.getEaseFn('SineIn')).toBe(SineWaves.prototype.Ease.SineIn);
      expect(SineWaves.prototype.getEaseFn('SineOut')).toBe(SineWaves.prototype.Ease.SineOut);
      expect(SineWaves.prototype.getEaseFn('SineInOut')).toBe(SineWaves.prototype.Ease.SineInOut);
    });

    it('should default to Linear', function() {
      expect(SineWaves.prototype.getEaseFn('FakeEase')).toBe(SineWaves.prototype.Ease.Linear);
    });
  })


  describe('degreesToRadians', function() {
    it('should convert radians to degrees' , function() {
      expect(SineWaves.prototype.degreesToRadians(0)).toBeCloseTo(0);
      expect(SineWaves.prototype.degreesToRadians(90)).toBeCloseTo(Math.PI * 0.5);
      expect(SineWaves.prototype.degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(SineWaves.prototype.degreesToRadians(270)).toBeCloseTo(Math.PI * 1.5);
      expect(SineWaves.prototype.degreesToRadians(360)).toBeCloseTo(Math.PI * 2);
    });

    it('should throw a TypeError if the input is not a number', function() {
      expect(function() {
        SineWaves.prototype.degreesToRadians({});
      }).toThrow(new TypeError('Degrees is not a number'));
    })
  });

  describe('rotation', function() {
    it('should return the radians of options.rotate', function (){
      var waves = new SineWaves({
        el: element,
        waves: [{}],
        width: 100,
        height: 100,
        rotate: 180
      });
      expect(waves.rotation()).toBe(Math.PI);
    })
  });

});
