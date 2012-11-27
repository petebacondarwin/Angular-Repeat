angular.module('repeat')

.factory('wrapArray', function() {
  var wrapFn = function(array) {
    return {
      collection: array,
      get: function(index) {
        return array[index];
      },
      key: function(index) {
        return index;
      },
      length: function() {
        return array.length;
      },
      copy: function() {
        return wrapFn(array.slice(0));
      }
    };
  };
  return wrapFn;
})

.factory('wrapObject', function() {
  var wrapFn = function(object) {
    var keys = [];
    for(var key in object) {
      if (object.hasOwnProperty(key) && key.charAt(0) != '$') {
        keys.push(key);
      }
    }
    keys.sort();

    return {
      collection: object,
      get: function(index) {
        return object[keys[index]];
      },
      key: function(index) {
        return keys[index];
      },
      length: function() {
        return keys.length;
      },
      copy: function() {
        var dst = {};
        for(var key in object) {
          if (object.hasOwnProperty(key) && key.charAt(0) != '$') {
            dst[key] = object[key];
          }
        }
        return wrapFn(dst);
      }
    };
  };
  return wrapFn;
});