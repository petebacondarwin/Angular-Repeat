angular.module('repeat')

.directive('myRepeat', ['whatChanged', 'flattenChanges', 'wrapArray', 'wrapObject', function(whatChanged, flattenChanges, wrapArray, wrapObject) {
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, clone) {
      var expression = attr.myRepeat;
      var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
      if (!match) {
        throw Error("Expected myRepeat in form of '_item_ in _collection_' but got '" + expression + "'.");
      }
      var identifiers = match[1];
      var sourceExpression = match[2];

      match = identifiers.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
      if (!match) {
        throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
            identifiers + "'.");
      }
      var valueIdentifier = match[3] || match[1];
      var keyIdentifier = match[2];
      var wrapFn = keyIdentifier ? wrapObject : wrapArray;

      var updateScope = function(scope, value, key) {
        scope[valueIdentifier] = value;
        if (keyIdentifier) {
          scope[keyIdentifier] = key;
        }
      };

      // Return the linking function for this directive
      return function(scope, startElement, attr){
        var originalCollection = wrapFn([]);
        var originalChildItems = [];
        var containerElement = startElement.parent();

        scope.$watch(function myRepeatWatch(scope){
          var item, key;
          var newCollection = wrapFn(scope.$eval(sourceExpression));
          var newChildItems = [];
          var temp = whatChanged(originalCollection, newCollection);
          var changes = flattenChanges(temp);

          // Iterate over the flattened changes array - updating the childscopes and elements accordingly
          var lastChildScope, newChildScope, newChildItem;
          var currentElement = startElement;
          var itemIndex = 0, changeIndex = 0;
          while(changeIndex < changes.length) {
            item = changes[changeIndex];
            if ( !angular.isDefined(item) ) {
              // No change for this item just copy it over
              newChildItem = originalChildItems[itemIndex];
              newChildItems.push(newChildItem);
              currentElement = newChildItem.element;
              itemIndex++;
              changeIndex++;
              continue;
            }
            if ( item.deleted ) {
              // An item has been deleted here - destroy the old scope and remove the old element
              var originalChildItem = originalChildItems[itemIndex];
              originalChildItem.scope.$destroy();
              originalChildItem.element.remove();
              // If an item is added or moved here as well then the index will incremented in the added or moved if statement below
              if ( !item.added && !item.moved ) {
                itemIndex++;
              }
            }
            if ( item.added ) {
              // An item has been added here - create a new scope and clone a new element
              newChildItem = { scope: scope.$new() };
              updateScope(newChildItem.scope, item.value, newCollection.key(item.index));
              clone(newChildItem.scope, function(newChildElement){
                currentElement.after(newChildElement);
                currentElement = newChildItem.element = newChildElement;
              });
              newChildItems.push(newChildItem);
              itemIndex++;
            }
            if ( item.modified ) {
              // This item is a primitive that has been modified - update the scope
              newChildItem = originalChildItems[itemIndex];
              updateScope(newChildItem.scope, item.newValue, newCollection.key(item.index));
              newChildItems.push(newChildItem);
              currentElement = newChildItem.element;
              itemIndex++;
            }
            if ( item.moved ) {
              // An object has moved here from somewhere else - move the element accordingly
              newChildItem = originalChildItems[item.oldIndex];
              newChildItems.push(newChildItem);
              currentElement.after(newChildItem.element);
              currentElement = newChildItem.element;
              itemIndex++;
            }
            changeIndex++;
          }
          while( itemIndex < originalChildItems.length ) {
            // No change for this item just copy it over
            newChildItem = originalChildItems[itemIndex];
            newChildItems.push(newChildItem);
            currentElement = newChildItem.element;
            itemIndex++;
          }

          // Update $index, $first, $middle & $last
          for(var index=0; index<newChildItems.length; index++) {
            if (angular.isDefined(newChildItems[index]) ) {
              newChildScope = newChildItems[index].scope;
              newChildScope.$index = index;
              newChildScope.$first = (index === 0);
              newChildScope.$middle = (index !== 0);
              newChildScope.$last = false;
              lastChildScope = newChildScope;
            }
          }
          // Fix up last item
          if ( angular.isDefined(lastChildScope) ) {
            lastChildScope.$last = true;
            lastChildScope.$middle = false;
          }

          // Store originals for next time
          originalCollection = newCollection.copy();
          originalChildItems = newChildItems.slice(0);
        });

      };
    }
  };
}]);