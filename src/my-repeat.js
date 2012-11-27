angular.module('repeat')

.directive('myRepeat', ['whatChanged', 'flattenChanges', function(whatChanged, flattenChanges) {
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
      var valueIdentity = match[1];
      var sourceExpression = match[2];

      match = valueIdentity.match(/^(?:([\$\w]+))$/);
      if (!match) {
        throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
            valueIdentity + "'.");
      }

      // Return the linking function for this directive
      return function(scope, startElement, attr){
        var originalCollection = [];
        var originalChildItems = [];
        var containerElement = startElement.parent();


        scope.$watch(function myRepeatWatch(scope){
          var item;
          var newCollection = scope.$eval(sourceExpression);

          // Make a copy of the child items that will be updated
          var newChildItems = [];

          var temp = whatChanged(originalCollection, newCollection);
          var changes = flattenChanges(temp);

          // Iterate of the flattened changes array - updating the childscopes and elements accordingly
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
              // This item was deleted - destroy the scope and remove the element
              var originalChildItem = originalChildItems[itemIndex];
              originalChildItem.scope.$destroy();
              originalChildItem.element.remove();
              if ( !item.added && !item.moved ) {
                // If an item had been added or moved here as well the the index will be moved forward there
                itemIndex++;
              }
            }
            if ( item.added ) {
              // This item has been added - create a new scope and clone a new element
              newChildItem = { scope: scope.$new() };
              newChildItem.scope[valueIdentity] = item.value;
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
              newChildItem.scope[valueIdentity] = item.newValue;
              newChildItems.push(newChildItem);
              itemIndex++;
              currentElement = newChildItem.element;
            }
            if ( item.moved ) {
              // This item is an object that has moved from somewhere else - move the element
              newChildItem = originalChildItems[item.oldIndex];
              newChildItems.push(newChildItem);
              itemIndex++;
              currentElement.after(newChildItem.element);
              currentElement = newChildItem.element;
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
          originalCollection = newCollection.slice(0);
          originalChildItems = newChildItems.slice(0);
        });

      };
    }
  };
}]);