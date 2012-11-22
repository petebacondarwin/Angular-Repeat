angular.module('repeat').factory('whatChanged', function() {
  var uid = ['0', '0', '0'];

  return function(original, changed) {
    var changes = {
      additions: [],
      deletions: [],
      moves: [],
      modifications: []
    };
    var objHash = [];
    function getEntry(obj) {
      var key = hashKey(obj);
      var entry = objHash[key];
      if ( !angular.isDefined(entry) ) {
        entry = ({ newIndexes: [], oldIndexes: [], obj: obj });
      }
      objHash[key] = entry;
      return entry;
    }
    function storeNewObj(index) {
      getEntry(changed[index]).newIndexes.push(index);
    }
    function storeOldObj(index) {
      getEntry(original[index]).oldIndexes.push(index);
    }
    function pushDeletion(index) {
      changes.deletions.push({ index: index, oldValue: original[index]});
    }
    function pushAddition(index) {
      changes.additions.push({ index: index, newValue: changed[index]});
    }
    function pushModifications(index) {
      changes.modifications.push( { index: index, oldValue: original[index], newValue: changed[index]});
    }
    function pushMove(oldIndex, newIndex) {
      changes.moves.push( { oldIndex: oldIndex, newIndex: newIndex, value: original[oldIndex]});
    }

    var index = 0;
    while(index < original.length && index < changed.length) {
      if ( original[index] !== changed[index] ) {
        // Something has changesd...
        if ( !angular.isObject(original[index]) ) {
          // Original item is not an object
          if ( !angular.isObject(changed[index]) ) {
            // Neither is Changed item - so we add a modifications at this index
            pushModifications(index);
          } else {
            // Changed item is an object - so add a deletion for the original primitive...
            pushDeletion(index);
            // ...and store the new object index for later
            storeNewObj(index);
          }
        } else {
          // Original item is an object
          if ( !angular.isObject(changed[index]) ) {
            // Changed item is not an object - so add an addition for the new primitive...
            pushAddition(index);
            // ...and store the old object index for later
            storeOldObj(index);
          } else {
            // Both Original and Changed items are objects - so store both items for later
            storeOldObj(index);
            storeNewObj(index);
          }
        }
      }
      index++;
    }
    while ( index < changed.length ) {
      if ( !angular.isObject(changed[index]) ) {
        changes.additions.push( { index: index, newValue: changed[index]});
      } else {
        storeNewObj(index);
      }
      index++;
    }
    while ( index < original.length ) {
      if ( !angular.isObject(original[index]) ) {
        changes.deletions.push( { index: index, oldValue: original[index]});
      } else {
        storeOldObj(index);
      }
      index++;
    }

    for(var key in objHash) {
      var entry = objHash[key];
      index = 0;
      while(index < entry.oldIndexes.length && index < entry.newIndexes.length) {
        pushMove(entry.oldIndexes[index], entry.newIndexes[index]);
        index++;
      }
      while(index < entry.oldIndexes.length) {
        pushDeletion(entry.oldIndexes[index]);
        index++;
      }
      while(index < entry.newIndexes.length) {
        pushAddition(entry.newIndexes[index]);
        index++;
      }
    }
    return changes;
  };

  
  /**
   * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
   * characters such as '012ABC'. The reason why we are not using simply a number counter is that
   * the number string gets longer over time, and it can also overflow, where as the the nextId
   * will grow much slower, it is a string, and it will never overflow.
   *
   * @returns an unique alpha-numeric string
   */
  function nextUid() {
    var index = uid.length;
    var digit;

    while(index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if (digit == 57 /*'9'*/) {
        uid[index] = 'A';
        return uid.join('');
      }
      if (digit == 90  /*'Z'*/) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return uid.join('');
      }
    }
    uid.unshift('0');
    return uid.join('');
  }

  /**
   * Computes a hash of an 'obj'.
   * Hash of a:
   *  string is string
   *  number is number as string
   *  object is either result of calling $$hashKey function on the object or uniquely generated id,
   *         that is also assigned to the $$hashKey property of the object.
   *
   * @param obj
   * @returns {string} hash string such that the same input will have the same hash string.
   *         The resulting string key is in 'type:hashKey' format.
   */
  function hashKey(obj) {
    var objType = typeof obj,
        key;

    if (objType == 'object' && obj !== null) {
      if (typeof (key = obj.$$hashKey) == 'function') {
        // must invoke on object to keep the right this
        key = obj.$$hashKey();
      } else if (key === undefined) {
        key = obj.$$hashKey = nextUid();
      }
    } else {
      key = obj;
    }

    return objType + ':' + key;
  }  
});