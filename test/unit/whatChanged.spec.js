describe('repeat', function() {
  angular.module('test', []).config(function($rootScopeProvider) {
    $rootScopeProvider.digestTtl(2);
  });
  beforeEach(module('test'));
  beforeEach(module('repeat'));

  describe('whatChanged - arrays', function() {
    var whatChanged;
    var wrapArray;

    beforeEach(function () {
      inject(function(_whatChanged_, _wrapArray_) {
        whatChanged = _whatChanged_;
        wrapArray = _wrapArray_;
      });
    });

    describe('primitive changes', function() {
      var original = [0,1,2,3,4];
      it('should have nothing changed if primitive items are the same', function() {
        var changed = [0,1,2,3,4];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify indexes of primitives that have changed', function() {
        var changed = [0,1,3,4,2];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([
          { index: 2, oldValue: 2, newValue: 3 },
          { index: 3, oldValue: 3, newValue: 4 },
          { index: 4, oldValue: 4, newValue: 2 }
        ]);
      });

      it('should be able to identify added primitives', function() {
        var changed = [0,1,2,3,4,5,6];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([
          { index: 5, value: 5 },
          { index: 6, value: 6 }
        ]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify removed primitives', function() {
        var changed = [0,1,2];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          { index: 3, oldValue: 3 },
          { index: 4, oldValue: 4 }
        ]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify modifications and additions', function () {
        var changed = [0,7,8,3,4,5,6];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([
          { index: 5, value: 5 },
          { index: 6, value: 6 }
        ]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([
          { index: 1, oldValue: 1, newValue: 7 },
          { index: 2, oldValue: 2, newValue: 8 }
        ]);
      });

      it('should be able to identify modifications and deletions', function () {
        var changed = [0,7,8];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          { index: 3, oldValue: 3 },
          { index: 4, oldValue: 4 }
        ]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([
          { index: 1, oldValue: 1, newValue: 7 },
          { index: 2, oldValue: 2, newValue: 8 }
        ]);
      });
    });

    describe('object changes', function() {
      var obj1, obj2, obj3;
      var original;
      beforeEach(function() {
        obj1 = {};
        obj2 = ['a','b'];
        obj3 = {};
        original = [obj1, obj2, obj3];
      });

      it('should have nothing changed if the objects are identical', function() {
        var changed = [obj1, obj2, obj3];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object moves', function() {
        var changed = [obj1, obj3, obj2];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([
          { value: obj2, oldIndex: 1, index: 2 },
          { value: obj3, oldIndex: 2, index: 1 }
        ]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if a new object is added', function() {
        var obj4 = {};
        var changed = [obj1, obj2, obj3, obj4];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([
          {index: 3, value: obj4 }
        ]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object is deleted from the end', function() {
        var changed = [obj1, obj2];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          {index: 2, oldValue: obj3 }
        ]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object is deleted from the front', function() {
        var changed = [obj2, obj3];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          {index: 0, oldValue: obj1 }
        ]);
        expect(changes.moves).toEqual([
          { value: obj2, oldIndex: 1, index: 0 },
          { value: obj3, oldIndex: 2, index: 1 }
          ]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object is deleted causing others to move', function() {
        var changed = [obj1, obj3];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          {index: 1, oldValue: obj2 }
        ]);
        expect(changes.moves).toEqual([
          {value: obj3, oldIndex: 2, index: 1}
        ]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to cope with multiple copies of the same object', function() {
        original = [obj1, obj1, obj1];
        var changed = [obj1, obj1, obj1];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to cope with addition when there are multiple copies', function() {
        original = [obj1, obj1, obj1];
        var changed = [obj1, obj2, obj1];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([
          { index: 1, value: obj2 }
        ]);
        expect(changes.deletions).toEqual([
          { index: 1, oldValue: obj1 }
        ]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to cope with changing when there are multiple copies', function() {
        original = [obj1, obj1, obj1];
        var changed = [obj1, obj1];
        var changes = whatChanged(wrapArray(original), wrapArray(changed));
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          { index: 2, oldValue: obj1 }
        ]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });
    });
  });

  describe('flatten', function() {
    var flattenChanges;

    beforeEach(function () {
      inject(function(_flattenChanges_) {
        flattenChanges = _flattenChanges_;
      });
    });

    it('should flatten changes into a single indexed array', function() {
      var flattened;
      var changes = {
        additions: [],
        deletions: [],
        modifications: [],
        moves: []
      };

      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(0);

      changes.additions.push({ index: 2, value: 'someVal'});
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(3);
      expect(flattened[0]).toBeUndefined();
      expect(flattened[1]).toBeUndefined();
      expect(flattened[2].added).toBe(true);
      expect(flattened[2].value).toBe('someVal');

      changes.deletions.push({ index: 2, oldValue: {}});
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(3);
      expect(flattened[0]).toBeUndefined();
      expect(flattened[1]).toBeUndefined();
      expect(flattened[2].added).toBe(true);
      expect(flattened[2].value).toBe('someVal');
      expect(flattened[2].deleted).toBe(true);

      changes.modifications.push({ index: 4, oldValue: 'something', newValue: 23 });
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(5);
      expect(flattened[0]).toBeUndefined();
      expect(flattened[1]).toBeUndefined();
      expect(flattened[2].added).toBe(true);
      expect(flattened[2].value).toBe('someVal');
      expect(flattened[2].deleted).toBe(true);
      expect(flattened[4].modified).toBe(true);
      expect(flattened[4].oldValue).toBe('something');
      expect(flattened[4].newValue).toBe(23);

      changes.moves.push({ oldIndex: 3, index: 1, value: {} });
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(5);
      expect(flattened[0]).toBeUndefined();
      expect(flattened[1].moved).toBe(true);
      expect(flattened[1].value).toEqual({});
      expect(flattened[1].oldIndex).toBe(3);
      expect(flattened[1].index).toBe(1);
      expect(flattened[2].added).toBe(true);
      expect(flattened[2].value).toBe('someVal');
      expect(flattened[2].deleted).toBe(true);
      expect(flattened[4].modified).toBe(true);
      expect(flattened[4].oldValue).toBe('something');
      expect(flattened[4].newValue).toBe(23);
    });

    it('should be able to identify if an object is deleted from the front', function() {
      var obj1 = {}, obj2 = {}, obj3 = {};
      var changes = {
        additions:[],
        deletions: [
          {index: 0, oldValue: obj1 }
        ],
        moves: [
          { value: obj2, oldIndex: 1, index: 0 },
          { value: obj3, oldIndex: 2, index: 1 }
        ],
        modifications: []
      };
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(2);
      expect(flattened[0].deleted).toBe(true);
      expect(flattened[0].moved).toBe(true);
      expect(flattened[1].moved).toBe(true);
    });

    it('should not be affected by previous calls', function() {
      var flattened;
      var changes = {
        additions: [],
        deletions: [],
        modifications: [],
        moves: []
      };

      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(0);

      changes.additions.push({ index: 2, value: 'someVal'});
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(3);

      changes.additions = [];
      flattened = flattenChanges(changes);
      expect(flattened.length).toBe(0);
    });
  });

});