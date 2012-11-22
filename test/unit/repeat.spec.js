describe('repeat', function() {
  describe('whatChanged', function() {
    var whatChanged;

    beforeEach(function () {
      module('repeat');
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
          { index: 5, newValue: 5 },
          { index: 6, newValue: 6 }
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
          { index: 5, newValue: 5 },
          { index: 6, newValue: 6 }
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
        obj2 = {};
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
          {index: 3, newValue: obj4 }
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
          { index: 1, newValue: obj2 }
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

  xdescribe('my-repeater directive', function() {
    var element;


    afterEach(function(){
      dealoc(element);
    });


    it('should ngRepeat over array', inject(function($rootScope, $compile) {
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


    it('should ngRepeat over array of primitive correctly', inject(function($rootScope, $compile) {
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


    it('should ngRepeat over object', inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="(key, value) in items" ng-bind="key + \':\' + value + \';\' "></li>' +
        '</ul>')($rootScope);
      $rootScope.items = {misko:'swe', shyam:'set'};
      $rootScope.$digest();
      expect(element.text()).toEqual('misko:swe;shyam:set;');
    }));

    
    it('should ngRepeat over object with primitive value correctly', inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="(key, value) in items" ng-bind="key + \':\' + value + \';\' "></li>' +
        '</ul>')($rootScope);
      $rootScope.items = {misko:'true', shyam:'true', zhenbo: 'true'};
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('misko:true;shyam:true;zhenbo:true;');
    
      $rootScope.items = {misko:'false', shyam:'true', zhenbo: 'true'};
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('misko:false;shyam:true;zhenbo:true;');
    
      $rootScope.items = {misko:'false', shyam:'false', zhenbo: 'false'};
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(3);
      expect(element.text()).toEqual('misko:false;shyam:false;zhenbo:false;');
    
      $rootScope.items = {misko:'true'};
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(1);
      expect(element.text()).toEqual('misko:true;');

      $rootScope.items = {shyam:'true', zhenbo: 'false'};
      $rootScope.$digest();
      expect(element.find('li').length).toEqual(2);
      expect(element.text()).toEqual('shyam:true;zhenbo:false;');
    }));


    it('should not ngRepeat over parent properties', inject(function($rootScope, $compile) {
      var Class = function() {};
      Class.prototype.abc = function() {};
      Class.prototype.value = 'abc';

      element = $compile(
        '<ul>' +
          '<li my-repeat="(key, value) in items" ng-bind="key + \':\' + value + \';\' "></li>' +
        '</ul>')($rootScope);
      $rootScope.items = new Class();
      $rootScope.items.name = 'value';
      $rootScope.$digest();
      expect(element.text()).toEqual('name:value;');
    }));


    it('should error on wrong parsing of ngRepeat', inject(function($rootScope, $compile) {
      expect(function() {
        element = $compile('<ul><li my-repeat="i dont parse"></li></ul>')($rootScope);
      }).toThrow("Expected ngRepeat in form of '_item_ in _collection_' but got 'i dont parse'.");
    }));


    it("should throw error when left-hand-side of ngRepeat can't be parsed", inject(
        function($rootScope, $compile) {
      expect(function() {
        element = $compile('<ul><li my-repeat="i dont parse in foo"></li></ul>')($rootScope);
      }).toThrow("'item' in 'item in collection' should be identifier or (key, value) but got " +
                 "'i dont parse'.");
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


    it('should expose iterator offset as $index when iterating over objects',
        inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="(key, val) in items" ng-bind="key + \':\' + val + $index + \'|\'"></li>' +
        '</ul>')($rootScope);
      $rootScope.items = {'misko':'m', 'shyam':'s', 'frodo':'f'};
      $rootScope.$digest();
      expect(element.text()).toEqual('frodo:f0|misko:m1|shyam:s2|');
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


    it('should expose iterator position as $first, $middle and $last when iterating over objects',
        inject(function($rootScope, $compile) {
      element = $compile(
        '<ul>' +
          '<li my-repeat="(key, val) in items">{{key}}:{{val}}:{{$first}}-{{$middle}}-{{$last}}|</li>' +
        '</ul>')($rootScope);
      $rootScope.items = {'misko':'m', 'shyam':'s', 'doug':'d', 'frodo':'f'};
      $rootScope.$digest();
      expect(element.text()).
          toEqual('doug:d:true-false-false|' +
                  'frodo:f:false-true-false|' +
                  'misko:m:false-true-false|' +
                  'shyam:s:false-false-true|');

      delete $rootScope.items.doug;
      delete $rootScope.items.frodo;
      $rootScope.$digest();
      expect(element.text()).toEqual('misko:m:true-false-false|shyam:s:false-false-true|');

      delete $rootScope.items.shyam;
      $rootScope.$digest();
      expect(element.text()).toEqual('misko:m:true-false-true|');
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
            '<li my-repeat="item in items">{{key}}:{{val}}|></li>' +
          '</ul>')($rootScope);
        a = {};
        b = {};
        c = {};
        d = {};

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