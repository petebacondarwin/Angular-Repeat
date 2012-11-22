angular.module('repeat')

.directive('myRepeat', ['whatChanged', 'flattenChanges', function(whatChanged, flattenChanges) {
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, linker) {
      var expression = attr.myRepeat;
      var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
      if (!match) {
        throw Error("Expected myRepeat in form of '_item_ in _collection_' but got '" + expression + "'.");
      }
      var valueIdentity = match[1];
      var sourceExpression = match[2];

      // Return the linking function for this directive
      return function(scope, templateElement, attr){
        var originalCollection = [];
        var originalChildItems = [];
        var containerElement = templateElement.parent();

        scope.$watch(function myRepeatWatch(scope){
          var index, item;
          var newCollection = scope.$eval(sourceExpression);

          // Make a copy of the child items that will be updated
          var newChildItems = [];
          for(index=0; index<originalChildItems.length; index++) {
            newChildItems[index] = originalChildItems[index];
          }

          var temp = whatChanged(originalCollection, newCollection);
          var changes = flattenChanges(temp);


          // Iterate of the flattened changes array - updating the childscopes accordingly
          var lastChildScope, newChildScope;
          for(index = 0; index < changes.length; index++) {
            item = changes[index];
            if ( angular.isDefined(item)) {
              if ( item.added ) {
                var newChildItem = newChildItems[index] = { scope: scope.$new() };
                newChildScope = newChildItem.scope;
                newChildScope[valueIdentity] = item.value;

                linker(newChildItem.scope, function(newChildElement){
                  if ( index > 0 ) {
                    angular.element(containerElement.children()[index-1]).after(newChildElement);
                  } else {
                    containerElement.prepend(newChildElement);
                  }
                  newChildItem.element = newChildElement;
                });
              } else if ( item.deleted ) {
                var originalChildItem = originalChildItems[index];
                originalChildItem.scope.$destroy();
                originalChildItem.element.remove();
                newChildItems[item.index] = undefined;
              } else if ( item.modified ) {
                newChildItems[index].scope[valueIdentity] = item.newValue;
              } else if ( item.moved ) {
                newChildItems[item.index] = originalChildItems[item.oldIndex];
              }
            }
          }
          for(index=0; index<newChildItems.length; index++) {
            if (angular.isDefined(newChildItems[index]) ) {
              // Update $index, $first, $middle & $last
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
          originalCollection = newCollection;
          originalChildItems = newChildItems;
        });

      };
    }
  };
}]);