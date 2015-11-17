import * as util from '../../src/utilities';

describe('utilities.js', function() {

  describe('degreesToRadians', function() {
    it('should convert radians to degrees' , function() {
      expect(util.degreesToRadians(0)).toBeCloseTo(0);
      expect(util.degreesToRadians(90)).toBeCloseTo(Math.PI * 0.5);
      expect(util.degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(util.degreesToRadians(270)).toBeCloseTo(Math.PI * 1.5);
      expect(util.degreesToRadians(360)).toBeCloseTo(Math.PI * 2);
    });

    it('should throw a TypeError if the input is not a number', function() {
      expect(function() {
        util.degreesToRadians({});
      }).toThrow(new TypeError('Degrees is not a number'));
    });
  });

});
