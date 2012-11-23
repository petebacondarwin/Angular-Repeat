describe('repeat', function() {
  angular.module('test', []).config(function($rootScopeProvider) {
    $rootScopeProvider.digestTtl(2);
  });
  beforeEach(module('test'));
  beforeEach(module('repeat'));

  describe('whatChanged', function() {
    var whatChanged;

    beforeEach(function () {
      inject(function(_whatChanged_) {
        whatChanged = _whatChanged_;
      });
    });

    describe('primitive changes', function() {
      var original = [0,1,2,3,4];
      it('should have nothing changed if primitive items are the same', function() {
        var changed = [0,1,2,3,4];
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify indexes of primitives that have changed', function() {
        var changed = [0,1,3,4,2];
        var changes = whatChanged(original, changed);
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
        var changes = whatChanged(original, changed);
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
        var changes = whatChanged(original, changed);
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
        var changes = whatChanged(original, changed);
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
        var changes = whatChanged(original, changed);
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
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object moves', function() {
        var changed = [obj1, obj3, obj2];
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([
          { value: obj2, oldIndex: 1, newIndex: 2 },
          { value: obj3, oldIndex: 2, newIndex: 1 }
        ]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if a new object is added', function() {
        var obj4 = {};
        var changed = [obj1, obj2, obj3, obj4];
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([
          {index: 3, value: obj4 }
        ]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object is deleted from the end', function() {
        var changed = [obj1, obj2];
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          {index: 2, oldValue: obj3 }
        ]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to identify if an object is deleted causing others to move', function() {
        var changed = [obj1, obj3];
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([
          {index: 1, oldValue: obj2 }
        ]);
        expect(changes.moves).toEqual([
          {value: obj3, oldIndex: 2, newIndex: 1}
        ]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to cope with multiple copies of the same object', function() {
        original = [obj1, obj1, obj1];
        var changed = [obj1, obj1, obj1];
        var changes = whatChanged(original, changed);
        expect(changes.additions).toEqual([]);
        expect(changes.deletions).toEqual([]);
        expect(changes.moves).toEqual([]);
        expect(changes.modifications).toEqual([]);
      });

      it('should be able to cope with addition when there are multiple copies', function() {
        original = [obj1, obj1, obj1];
        var changed = [obj1, obj2, obj1];
        var changes = whatChanged(original, changed);
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
        var changes = whatChanged(original, changed);
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

      changes.moves.push({ oldIndex: 3, newIndex: 1, value: {} });
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

  describe('my-repeater directive', function() {
    var element;


    it('should myRepeat over array', inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="item in items" ng-init="suffix = \';\'" ng-bind="item + suffix"></li>' +
        '</ul>')($rootScope);

      Array.prototype.extraProperty = "should be ignored";
      // INIT
      $rootScope.items = ['misko', 'shyam'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(2);
      expect(element.text()).toEqual('misko;shyam;');
      delete Array.prototype.extraProperty;

      // GROW
      $rootScope.items = ['adam', 'kai', 'brad'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('adam;kai;brad;');

      // SHRINK
      $rootScope.items = ['brad'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(1);
      expect(element.text()).toEqual('brad;');
    }));


    it('should myRepeat over array of primitive correctly', inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="item in items" ng-init="suffix = \';\'" ng-bind="item + suffix"></li>' +
        '</ul>')($rootScope);

      Array.prototype.extraProperty = "should be ignored";
      // INIT
      $rootScope.items = [true, true, true];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('true;true;true;');
      delete Array.prototype.extraProperty;

      $rootScope.items = [false, true, true];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('false;true;true;');

      $rootScope.items = [false, true, false];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('false;true;false;');

      $rootScope.items = [true];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(1);
      expect(element.text()).toEqual('true;');

      $rootScope.items = [true, true, false];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('true;true;false;');

      $rootScope.items = [true, false, false];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('true;false;false;');

      // string
      $rootScope.items = ['a', 'a', 'a'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('a;a;a;');

      $rootScope.items = ['ab', 'a', 'a'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('ab;a;a;');

      $rootScope.items = ['test'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(1);
      expect(element.text()).toEqual('test;');
    
      $rootScope.items = ['same', 'value'];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(2);
      expect(element.text()).toEqual('same;value;');
    
    // number
      $rootScope.items = [12, 12, 12];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('12;12;12;');

      $rootScope.items = [53, 12, 27];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('53;12;27;');

      $rootScope.items = [89];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(1);
      expect(element.text()).toEqual('89;');

      $rootScope.items = [89, 23];
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(2);
      expect(element.text()).toEqual('89;23;');
    }));


    it('should error on wrong parsing of myRepeat', inject(function($rootScope, $compile) {
      expect(function() {
        element = $compile('<ul><li my-repeat="i dont parse"></li></ul>')($rootScope);
      }).toThrow("Expected myRepeat in form of '_item_ in _collection_' but got 'i dont parse'.");
    }));


    it('should expose iterator offset as $index when iterating over arrays',
        inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="item in items" ng-bind="item + $index + \'|\'"></li>' +
        '</ul>')($rootScope);
      $rootScope.items = ['misko', 'shyam', 'frodo'];
      $rootScope.$digest();
      expect(element.text()).toEqual('misko0|shyam1|frodo2|');
    }));


    it('should expose iterator position as $first, $middle and $last when iterating over arrays',
        inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="item in items">{{item}}:{{$first}}-{{$middle}}-{{$last}}|</li>' +
        '</ul>')($rootScope);
      $rootScope.items = ['misko', 'shyam', 'doug'];
      $rootScope.$digest();
      expect(element.text()).
          toEqual('misko:true-false-false|shyam:false-true-false|doug:false-false-true|');

      $rootScope.items.push('frodo');
      $rootScope.$digest();
      expect(element.text()).
          toEqual('misko:true-false-false|' +
                  'shyam:false-true-false|' +
                  'doug:false-true-false|' +
                  'frodo:false-false-true|');

      $rootScope.items.pop();
      $rootScope.items.pop();
      $rootScope.$digest();
      expect(element.text()).toEqual('misko:true-false-false|shyam:false-false-true|');

      $rootScope.items.pop();
      $rootScope.$digest();
      expect(element.text()).toEqual('misko:true-false-true|');
    }));


    it('should ignore $ and $$ properties', inject(function($rootScope, $compile) {
      element = $compile('<ul><li my-repeat="i in items">{{i}}|</li></ul>')($rootScope);
      $rootScope.items = ['a', 'b', 'c'];
      $rootScope.items.$$hashkey = 'xxx';
      $rootScope.items.$root = 'yyy';
      $rootScope.$digest();

      expect(element.text()).toEqual('a|b|c|');
    }));


    it('should repeat over nested arrays', inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="subgroup in groups">' +
            '<div my-repeat="group in subgroup">{{group}}|</div>X' +
          '</li>' +
        '</ul>')($rootScope);
      $rootScope.groups = [['a', 'b'], ['c','d']];
      $rootScope.$digest();

      expect(element.text()).toEqual('a|b|Xc|d|X');
    }));


    it('should ignore non-array element properties when iterating over an array',
        inject(function($rootScope, $compile) {
      element = $compile('<ul><li my-repeat="item in array">{{item}}|</li></ul>')($rootScope);
      $rootScope.array = ['a', 'b', 'c'];
      $rootScope.array.foo = '23';
      $rootScope.array.bar = function() {};
      $rootScope.$digest();

      expect(element.text()).toBe('a|b|c|');
    }));


    it('should iterate over non-existent elements of a sparse array',
        inject(function($rootScope, $compile) {
      element = $compile('<ul><li my-repeat="item in array">{{item}}|</li></ul>')($rootScope);
      $rootScope.array = ['a', 'b'];
      $rootScope.array[4] = 'c';
      $rootScope.array[6] = 'd';
      $rootScope.$digest();

      expect(element.text()).toBe('a|b|||c||d|');
    }));


    it('should iterate over all kinds of types', inject(function($rootScope, $compile) {
      element = $compile('<ul><li my-repeat="item in array">{{item}}|</li></ul>')($rootScope);
      $rootScope.array = ['a', 1, null, undefined, {}];
      $rootScope.$digest();

      expect(element.text()).toMatch(/a\|1\|\|\|\{\s*\}\|/);
    }));


    describe('stability', function() {
      var a, b, c, d, lis;

      beforeEach(inject(function($rootScope, $compile) {
        element = $compile(
          '<ul>' +
            '<li my-repeat="item in items">{{$index}}:{{item.name}}</li>' +
          '</ul>')($rootScope);
        a = {name:'a'};
        b = {name:'b'};
        c = {name:'c'};
        d = {name:'d'};

        $rootScope.items = [a, b, c];
        $rootScope.$digest();
        lis = element.find('li');
      }));


      it('should preserve the order of elements', inject(function($rootScope) {
        $rootScope.items = [a, c, d];
        $rootScope.$digest();
        var newElements = element.find('li');
        expect(newElements[0]).toEqual(lis[0]);
        expect(newElements[1]).toEqual(lis[2]);
        expect(newElements[2]).not.toEqual(lis[1]);
      }));


      it('should support duplicates', inject(function($rootScope) {
        $rootScope.items = [a, a, b, c];
        $rootScope.$digest();
        var newElements = element.find('li');
        expect(newElements[0]).toEqual(lis[0]);
        expect(newElements[1]).not.toEqual(lis[0]);
        expect(newElements[2]).toEqual(lis[1]);
        expect(newElements[3]).toEqual(lis[2]);

        lis = newElements;
        $rootScope.$digest();
        newElements = element.find('li');
        expect(newElements[0]).toEqual(lis[0]);
        expect(newElements[1]).toEqual(lis[1]);
        expect(newElements[2]).toEqual(lis[2]);
        expect(newElements[3]).toEqual(lis[3]);

        $rootScope.$digest();
        newElements = element.find('li');
        expect(newElements[0]).toEqual(lis[0]);
        expect(newElements[1]).toEqual(lis[1]);
        expect(newElements[2]).toEqual(lis[2]);
        expect(newElements[3]).toEqual(lis[3]);
      }));


      it('should remove last item when one duplicate instance is removed',
          inject(function($rootScope) {
        $rootScope.items = [a, a, a];
        $rootScope.$digest();
        lis = element.find('li');

        $rootScope.items = [a, a];
        $rootScope.$digest();
        var newElements = element.find('li');
        expect(newElements.length).toEqual(2);
        expect(newElements[0]).toEqual(lis[0]);
        expect(newElements[1]).toEqual(lis[1]);
      }));


      it('should reverse items when the collection is reversed',
          inject(function($rootScope) {
        $rootScope.items = [a, b, c];
        $rootScope.$digest();
        lis = element.find('li');

        $rootScope.items = [c, b, a];
        $rootScope.$digest();
        var newElements = element.find('li');
        expect(newElements.length).toEqual(3);
        expect(newElements[0]).toEqual(lis[2]);
        expect(newElements[1]).toEqual(lis[1]);
        expect(newElements[2]).toEqual(lis[0]);
      }));
    });
  });
});