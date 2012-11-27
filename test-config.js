// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'test/lib/angular/angular.js',
  'test/lib/angular/angular-mocks.js',
  'src/module.js',
  'src/wrapper.js',
  'src/what-changed.js',
  'src/my-repeat.js',
  'test/unit/**/*.spec.js'
];

// possible values: 'dots' || 'progress'
reporters = 'progress';

// these are default values, just to show available options

// web server port
port = 8080;

// cli runner port
runnerPort = 9100;

urlRoot = '/';

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// polling interval in ms (ignored on OS that support inotify)
autoWatchInterval = 1000;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = [];
