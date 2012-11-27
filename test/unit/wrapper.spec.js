describe('repeat', function() {
  beforeEach(module('repeat'));

  describe('wrapArray', function() {
    var wrap;

    beforeEach(function () {
      inject(function(wrapArray) {
        wrap = wrapArray;
      });
    });

    it('should have same length as wrapped array', function() {
      var array = [0,1,2,3,4,5];
      var wrapped = wrap(array);
      expect(wrapped.length()).toBe(array.length);
    });

    it('should have same elements as wrapped array', function() {
      var array = [0,1,2,3,4,5];
      var wrapped = wrap(array);
      expect(wrapped.get(0)).toBe(array[0]);
      expect(wrapped.get(1)).toBe(array[1]);
      expect(wrapped.get(2)).toBe(array[2]);
      expect(wrapped.get(3)).toBe(array[3]);
      expect(wrapped.get(4)).toBe(array[4]);
      expect(wrapped.get(5)).toBe(array[5]);
    });

    it('should return a copy of the array, with a new wrapper', function() {
      var array = [0,1,2,3,4,5];
      var wrapped = wrap(array);
      var copy = wrapped.copy();
      expect(copy).not.toBe(wrapped);
      expect(copy.collection).not.toBe(wrapped.collection);
      expect(copy.collection).toEqual(wrapped.collection);
    });
  });

  describe('wrapObject', function() {
    var wrap;

    beforeEach(function () {
      inject(function(wrapObject) {
        wrap = wrapObject;
      });
    });

    it('should have same length as wrapped array', function() {
      var object = {a:0,b:1,c:2,d:3,e:4,f:5};
      var wrapped = wrap(object);
      expect(wrapped.length()).toBe(6);
    });

    it('should have same elements as wrapped object', function() {
      var object = {a:0,b:1,c:2,d:3,e:4,f:5};
      var wrapped = wrap(object);
      expect(wrapped.get(0)).toBe(object['a']);
      expect(wrapped.get(1)).toBe(object['b']);
      expect(wrapped.get(2)).toBe(object['c']);
      expect(wrapped.get(3)).toBe(object['d']);
      expect(wrapped.get(4)).toBe(object['e']);
      expect(wrapped.get(5)).toBe(object['f']);
    });

    it('should return a copy of the array, with a new wrapper', function() {
      var object = {a:0,b:1,c:2,d:3,e:4,f:5};
      var wrapped = wrap(object);
      var copy = wrapped.copy();
      expect(copy).not.toBe(wrapped);
      expect(copy.collection).not.toBe(wrapped.collection);
      expect(copy.collection).toEqual(wrapped.collection);
    });
  });
});