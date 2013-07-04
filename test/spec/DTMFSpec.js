describe("DTMF Generator", function() {
  var dtmf,
      testToneTime = 300;

  function makeMockOscillator() {
    return {
        playbackState: 0,
        type: 0,
        frequency: {
            value: 0
          },
        connect: jasmine.createSpy('Connect output'),
        disconnect: jasmine.createSpy('Disconnect output'),
        start: jasmine.createSpy('start oscillator').andCallFake(function() {this.playbackState = 2;})
      };
  }
  var mockAudioContext = {
    createOscillator: jasmine.createSpy('Create Oscillator').andCallFake(function() { return makeMockOscillator();}),
    destination: 'fakeDestination'
  };


  beforeEach(function() {
    dtmf = DTMF({audioContext: mockAudioContext, toneTime: testToneTime});
  });

  describe("initialisation", function() {
    it("should create two oscillators", function() {
      expect(dtmf.context.createOscillator).toHaveBeenCalled();
      expect(dtmf.context.createOscillator.callCount).toBe(2);
    });
  });

  describe("when generating a single symbol", function() {
    it("should generate a tone for a valid symbol", function() {
      dtmf.touch('1');

      expect(dtmf.oscillators.low.connect).toHaveBeenCalledWith('fakeDestination');
      expect(dtmf.oscillators.low.start).toHaveBeenCalledWith(0);

      expect(dtmf.oscillators.high.connect).toHaveBeenCalledWith('fakeDestination');
      expect(dtmf.oscillators.high.start).toHaveBeenCalledWith(0);

      expect(dtmf.oscillators.high.start.callCount).toBe(1);
      expect(dtmf.oscillators.high.start.callCount).toBe(1);

    });

    it("should generate multiple tones", function() {
      dtmf.touch('1');

      expect(dtmf.oscillators.low.start.callCount).toBe(1);
      expect(dtmf.oscillators.high.start.callCount).toBe(1);

    });

    it("should ignore an invalid symbol", function() {
      dtmf.touch('x');

      expect(dtmf.oscillators.low.connect).not.toHaveBeenCalled();
      expect(dtmf.oscillators.low.start).not.toHaveBeenCalled();

      expect(dtmf.oscillators.high.connect).not.toHaveBeenCalled();
      expect(dtmf.oscillators.high.start).not.toHaveBeenCalled();
    });

    it("should play the correct tones when called", function() {
      dtmf.touch('1');

      expect(dtmf.oscillators.low.frequency.value).toBe(697);
      expect(dtmf.oscillators.high.frequency.value).toBe(1209);

      dtmf.touch('2');

      expect(dtmf.oscillators.low.frequency.value).toBe(697);
      expect(dtmf.oscillators.high.frequency.value).toBe(1336);
    });
  });

  describe("when generating a tone sequence", function() {
    beforeEach(function() {
      dtmf.context.createOscillator.reset();
    });
    it("should play a sequence of tones when given a sequence of symbols", function() {
      jasmine.Clock.useMock();
      dtmf.dial('123');

      jasmine.Clock.tick(3*testToneTime);

      expect(dtmf.context.createOscillator.callCount).toBe(6);

    });

    it("should play the valid tones from a string mixing valid and invalid symbols", function() {
      jasmine.Clock.useMock();
      dtmf.dial('1X2');

      jasmine.Clock.tick(3*testToneTime);

      expect(dtmf.context.createOscillator.callCount).toBe(4);
    });

    it("should not play a second sequence if it is already playing a first.", function() {
      jasmine.Clock.useMock();
      dtmf.dial('123');

      jasmine.Clock.tick(1*testToneTime);
      dtmf.dial('123');

      jasmine.Clock.tick(2*testToneTime);

      expect(dtmf.context.createOscillator.callCount).toBe(6);
    });

  });
});