describe('ease.js', function() {

  describe('Ease.linear', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.linear(0, 100)).toBeCloseTo(100);
      expect(Ease.linear(0.25, 100)).toBeCloseTo(100);
      expect(Ease.linear(0.5, 100)).toBeCloseTo(100);
      expect(Ease.linear(0.75, 100)).toBeCloseTo(100);
      expect(Ease.linear(1, 100)).toBeCloseTo(100);
    });
  });

  describe('Ease.sineinout', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.sineinout(0, 100)).toBeCloseTo(0);
      expect(Ease.sineinout(0.25, 100)).toBeCloseTo(50);
      expect(Ease.sineinout(0.5, 100)).toBeCloseTo(100);
      expect(Ease.sineinout(0.75, 100)).toBeCloseTo(50);
      expect(Ease.sineinout(1, 100)).toBeCloseTo(0);
    });
  });

  describe('Ease.sinein', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.sinein(0, 100)).toBeCloseTo(0);
      expect(Ease.sinein(0.25, 100)).toBeCloseTo(14.644660940672626);
      expect(Ease.sinein(0.5, 100)).toBeCloseTo(50);
      expect(Ease.sinein(0.75, 100)).toBeCloseTo(85.35533905932738);
      expect(Ease.sinein(1, 100)).toBeCloseTo(100);
    });
  });

  describe('Ease.sineout', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.sineout(0, 100)).toBeCloseTo(100);
      expect(Ease.sineout(0.25, 100)).toBeCloseTo(85.35533905932738);
      expect(Ease.sineout(0.5, 100)).toBeCloseTo(50);
      expect(Ease.sineout(0.75, 100)).toBeCloseTo(14.644660940672626);
      expect(Ease.sineout(1, 100)).toBeCloseTo(0);
    });
  });

  describe('Easing', function() {
    it('should return a function if passed a function', function() {
      var expectedFn = function() {};
      expect(Utilities.getFn(Ease, expectedFn, 'linear')).toBe(expectedFn);
    });

    it('should return a function if passed a ease function name', function() {
      expect(Utilities.getFn(Ease, 'Linear', 'linear')).toBe(Ease.linear);
      expect(Utilities.getFn(Ease, 'SineIn', 'linear')).toBe(Ease.sinein);
      expect(Utilities.getFn(Ease, 'SineOut', 'linear')).toBe(Ease.sineout);
      expect(Utilities.getFn(Ease, 'SineInOut', 'linear')).toBe(Ease.sineinout);
    });

    it('should default to Linear', function() {
      expect(Utilities.getFn(Ease, 'FakeEase', 'linear')).toBe(Ease.linear);
    });
  });

});
