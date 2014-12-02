describe('ease.js', function() {

  describe('Ease.Linear', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.Linear(0, 100)).toBeCloseTo(100);
      expect(Ease.Linear(0.25, 100)).toBeCloseTo(100);
      expect(Ease.Linear(0.5, 100)).toBeCloseTo(100);
      expect(Ease.Linear(0.75, 100)).toBeCloseTo(100);
      expect(Ease.Linear(1, 100)).toBeCloseTo(100);
    });
  });

  describe('Ease.SineInOut', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.SineInOut(0, 100)).toBeCloseTo(0);
      expect(Ease.SineInOut(0.25, 100)).toBeCloseTo(50);
      expect(Ease.SineInOut(0.5, 100)).toBeCloseTo(100);
      expect(Ease.SineInOut(0.75, 100)).toBeCloseTo(50);
      expect(Ease.SineInOut(1, 100)).toBeCloseTo(0);
    });
  });

  describe('Ease.SineIn', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.SineIn(0, 100)).toBeCloseTo(0);
      expect(Ease.SineIn(0.25, 100)).toBeCloseTo(14.644660940672626);
      expect(Ease.SineIn(0.5, 100)).toBeCloseTo(50);
      expect(Ease.SineIn(0.75, 100)).toBeCloseTo(85.35533905932738);
      expect(Ease.SineIn(1, 100)).toBeCloseTo(100);
    });
  });

  describe('Ease.SineOut', function() {
    it('should ease a value from left to right', function() {
      expect(Ease.SineOut(0, 100)).toBeCloseTo(100);
      expect(Ease.SineOut(0.25, 100)).toBeCloseTo(85.35533905932738);
      expect(Ease.SineOut(0.5, 100)).toBeCloseTo(50);
      expect(Ease.SineOut(0.75, 100)).toBeCloseTo(14.644660940672626);
      expect(Ease.SineOut(1, 100)).toBeCloseTo(0);
    });
  });

  describe('Easing', function() {
    it('should return a function if passed a function', function() {
      var expectedFn = function() {};
      expect(Utilities.getFn(Ease, expectedFn, 'Linear')).toBe(expectedFn);
    });

    it('should return a function if passed a ease function name', function() {
      expect(Utilities.getFn(Ease, 'Linear', 'Linear')).toBe(Ease.Linear);
      expect(Utilities.getFn(Ease, 'SineIn', 'Linear')).toBe(Ease.SineIn);
      expect(Utilities.getFn(Ease, 'SineOut', 'Linear')).toBe(Ease.SineOut);
      expect(Utilities.getFn(Ease, 'SineInOut', 'Linear')).toBe(Ease.SineInOut);
    });

    it('should default to Linear', function() {
      expect(Utilities.getFn(Ease, 'FakeEase', 'Linear')).toBe(Ease.Linear);
    });
  });

});
