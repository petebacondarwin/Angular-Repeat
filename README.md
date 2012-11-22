# whatChanged Service
Experiment with watching changes between arrays - dealing with both primitives and objects.

In the case of primitives, it only cares about the value, and doesn't track moves. It doesn't try to guess what was added or deleted either.

In the case of objects it uses object identity (hash) to track objects so that it can tell if objects were moved.  It can handle multiple instances of the same objects.

The whatChanged service is a function to which you pass two arrays to be compared:

```
var changes = whatChanged(original, changed);
```

The changes object will look like this:

```
changes === {
  additions: [
    { index: 4, newValue: 'Some String'}
  ],
  deletions: [
    { index: 0, oldValue: {} },
  ],
  moves: [
    { oldIndex: 1, newIndex: 0, value: {} }
  ],
  "modified": [
    { index: 3, oldValue: 23, newValue: 45 }
  ]
};