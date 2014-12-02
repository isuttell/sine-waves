describe('utilities.js', function() {

  describe('degreesToRadians', function() {
    it('should convert radians to degrees' , function() {
      expect(Utilities.degreesToRadians(0)).toBeCloseTo(0);
      expect(Utilities.degreesToRadians(90)).toBeCloseTo(Math.PI * 0.5);
      expect(Utilities.degreesToRadians(180)).toBeCloseTo(Math.PI);
      expect(Utilities.degreesToRadians(270)).toBeCloseTo(Math.PI * 1.5);
      expect(Utilities.degreesToRadians(360)).toBeCloseTo(Math.PI * 2);
    });

    it('should throw a TypeError if the input is not a number', function() {
      expect(function() {
        Utilities.degreesToRadians({});
      }).toThrow(new TypeError('Degrees is not a number'));
    });
  });

});
