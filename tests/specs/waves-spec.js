describe('waves.js', function() {

  describe('Waves.Sine', function() {
    it('should calculate a sine wave', function() {
      expect(Waves.Sine(0)).toBeCloseTo(0);
      expect(Waves.Sine(0.25)).toBeCloseTo(0.24740395925452294);
      expect(Waves.Sine(0.5)).toBeCloseTo(0.479425538604203);
      expect(Waves.Sine(0.75)).toBeCloseTo(0.6816387600233342);
      expect(Waves.Sine(1)).toBeCloseTo(0.8414709848078965);
    });
  });

  describe('Waves.Square', function() {
    it('should calculate a square sine wave', function() {
      expect(Waves.Square(0)).toBeCloseTo(0);
      expect(Waves.Square(0.25)).toBeCloseTo(1);
      expect(Waves.Square(0.5)).toBeCloseTo(1);
      expect(Waves.Square(0.75)).toBeCloseTo(-1);
      expect(Waves.Square(1)).toBeCloseTo(-1);
    });
  });

  describe('Waves.Sawtooth', function() {
    it('should calculate a square sine wave', function() {
      expect(Waves.Sawtooth(0)).toBeCloseTo(0);
      expect(Waves.Sawtooth(0.25)).toBeCloseTo(0.5);
      expect(Waves.Sawtooth(0.5)).toBeCloseTo(-1);
      expect(Waves.Sawtooth(0.75)).toBeCloseTo(-0.5);
      expect(Waves.Sawtooth(1)).toBeCloseTo(0);
    });
  });

  describe('Waves.Triangle', function() {
    it('should calculate a square sine wave', function() {
      expect(Waves.Triangle(0)).toBeCloseTo(0);
      expect(Waves.Triangle(0.25)).toBeCloseTo(0.5);
      expect(Waves.Triangle(0.5)).toBeCloseTo(1);
      expect(Waves.Triangle(0.75)).toBeCloseTo(0.5);
      expect(Waves.Triangle(1)).toBeCloseTo(0);
    });
  });

});
