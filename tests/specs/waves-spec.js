describe('waves.js', function() {

  describe('Waves.Sine', function() {
    it('should calculate a sine wave', function() {
      expect(Waves.sine(0)).toBeCloseTo(0);
      expect(Waves.sine(0.25)).toBeCloseTo(0.24740395925452294);
      expect(Waves.sine(0.5)).toBeCloseTo(0.479425538604203);
      expect(Waves.sine(0.75)).toBeCloseTo(0.6816387600233342);
      expect(Waves.sine(1)).toBeCloseTo(0.8414709848078965);
    });
  });

  describe('Waves.square', function() {
    it('should calculate a square sine wave', function() {
      expect(Waves.square(0)).toBeCloseTo(0);
      expect(Waves.square(0.25)).toBeCloseTo(1);
      expect(Waves.square(0.5)).toBeCloseTo(1);
      expect(Waves.square(0.75)).toBeCloseTo(-1);
      expect(Waves.square(1)).toBeCloseTo(-1);
    });
  });

  describe('Waves.sawtooth', function() {
    it('should calculate a square sine wave', function() {
      expect(Waves.sawtooth(0)).toBeCloseTo(0);
      expect(Waves.sawtooth(0.25)).toBeCloseTo(0.5);
      expect(Waves.sawtooth(0.5)).toBeCloseTo(-1);
      expect(Waves.sawtooth(0.75)).toBeCloseTo(-0.5);
      expect(Waves.sawtooth(1)).toBeCloseTo(0);
    });
  });

  describe('Waves.triangle', function() {
    it('should calculate a square sine wave', function() {
      expect(Waves.triangle(0)).toBeCloseTo(0);
      expect(Waves.triangle(0.25)).toBeCloseTo(0.5);
      expect(Waves.triangle(0.5)).toBeCloseTo(1);
      expect(Waves.triangle(0.75)).toBeCloseTo(0.5);
      expect(Waves.triangle(1)).toBeCloseTo(0);
    });
  });

});
