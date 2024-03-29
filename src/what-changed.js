angular.module('repeat')

.factory('whatChanged', function() {
  var uid = ['0', '0', '0'];

  // This class is used to track whether objects have been added, deleted or moved
  function ObjectTracker(original, changed) {
    this.original = original;
    this.changed = changed;
    this.entries = [];
  }
  ObjectTracker.prototype = {
    getEntry: function (obj) {
      var key = hashKey(obj);
      var entry = this.entries[key];
      if ( !angular.isDefined(entry) ) {
        entry = ({ newIndexes: [], oldIndexes: [], obj: obj });
      }
      this.entries[key] = entry;
      return entry;
    },
    // An object is now at this index where it wasn't before
    addNewEntry: function(index) {
      this.getEntry(this.changed.get(index)).newIndexes.push(index);
    },
    // An object is no longer at this index
    addOldEntry: function(index) {
      this.getEntry(this.original.get(index)).oldIndexes.push(index);
    }
  };

  // This class tracks all the changes found between the original and changed arrays
  function Changes(original, changed) {
    this.original = original;
    this.changed = changed;
    // All additions in the form {index, value}
    this.additions = [];
    // All deletions in the form {index, oldValue}
    this.deletions = [];
    // All primitive value modifications in the form { index, }
    this.modifications = [];
    // All moved objects in the form {index, oldIndex, value}
    this.moves = [];
  }
  Changes.prototype = {
    // An addition was found at the given index
    pushAddition: function(index) {
      this.additions.push({ index: index, value: this.changed.get(index)});
    },
    // A deletion was found at the given index
    pushDeletion: function(index) {
      this.deletions.push({ index: index, oldValue: this.original.get(index)});
    },
    // A modification to a primitive value was found at the given index
    pushModifications: function(index) {
      this.modifications.push( { index: index, oldValue: this.original.get(index), newValue: this.changed.get(index)});
    },
    // An object has moved from oldIndex to newIndex
    pushMove: function(oldIndex, newIndex) {
      this.moves.push( { oldIndex: oldIndex, index: newIndex, value: this.original.get(oldIndex)});
    }
  };

  return function(original, changed) {
    var objTracker = new ObjectTracker(original, changed);
    var changes = new Changes(original, changed);

    var index = 0, changedItem, originalItem;
    while(index < original.length() && index < changed.length()) {
      changedItem = changed.get(index);
      originalItem = original.get(index);
      if ( originalItem !== changedItem ) {
        // Something has changed...
        if ( !angular.isObject(originalItem) ) {
          // Original item is not an object
          if ( !angular.isObject(changedItem) ) {
            // Neither is Changed item - so we add a modifications at this index
            changes.pushModifications(index);
          } else {
            // Changed item is an object - so add a deletion for the original primitive...
            changes.pushDeletion(index);
            // ...and store the new object index for later
            objTracker.addNewEntry(index);
          }
        } else {
          // Original item is an object
          if ( !angular.isObject(changedItem) ) {
            // Changed item is not an object - so add an addition for the new primitive...
            changes.pushAddition(index);
            // ...and store the old object index for later
            objTracker.addOldEntry(index);
          } else {
            // Both Original and Changed items are objects - so store both items for later
            objTracker.addOldEntry(index);
            objTracker.addNewEntry(index);
          }
        }
      }
      index++;
    }

    while ( index < changed.length() ) {
      if ( !angular.isObject(changed.get(index)) ) {
        changes.pushAddition(index);
      } else {
        objTracker.addNewEntry(index);
      }
      index++;
    }
    while ( index < original.length() ) {
      if ( !angular.isObject(originalItem) ) {
        changes.pushDeletion(index);
      } else {
        objTracker.addOldEntry(index);
      }
      index++;
    }

    var entries = objTracker.entries;
    for(var key in entries) {
      if ( !entries.hasOwnProperty(key) ) {
        continue;
      }
      var entry = entries[key];
      index = 0;
      while(index < entry.oldIndexes.length && index < entry.newIndexes.length) {
        changes.pushMove(entry.oldIndexes[index], entry.newIndexes[index]);
        index++;
      }
      while(index < entry.oldIndexes.length) {
        changes.pushDeletion(entry.oldIndexes[index]);
        index++;
      }
      while(index < entry.newIndexes.length) {
        changes.pushAddition(entry.newIndexes[index]);
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
})

.factory('flattenChanges', function() {

  function FlattenedChanges() {
    this.changes = [];
  }
  FlattenedChanges.prototype = {
    modified: function(item) {
      item.modified = true;
      this.changes[item.index] = item;
    },
    moved: function(change) {
      var item = this.changes[change.index];
      if ( angular.isDefined(item) ) {
        item.value = change.value;
        item.oldIndex = change.oldIndex;
      } else {
        item = change;
      }
      item.moved = true;
      this.changes[change.index] = item;
    },
    added: function(change){
      var item = this.changes[change.index];
      if ( angular.isDefined(item) ) {
        item.value = change.value;
      } else {
        item = change;
      }
      item.added = true;
      this.changes[change.index] = item;
    },
    deleted: function(change) {
      var item = this.changes[change.index];
      if ( !angular.isDefined(item) ) {
        item = change;
      }
      item.deleted = true;
      this.changes[change.index] = item;
    }
  };

  return function(changes) {
    var index, item;
    flattened = new FlattenedChanges();
    // Flatten all the changes into a array ordered by index
    for(index = 0; index < changes.modifications.length; index++) {
      item = changes.modifications[index];
      flattened.modified(item);
    }
    for(index = 0; index < changes.deletions.length; index++) {
      item = changes.deletions[index];
      flattened.deleted(item);
    }
    for(index = 0; index < changes.additions.length; index++) {
      item = changes.additions[index];
      flattened.added(item);
    }
    for(index = 0; index < changes.moves.length; index++) {
      item = changes.moves[index];
      flattened.moved(item);
    }
    return flattened.changes;
  };
});