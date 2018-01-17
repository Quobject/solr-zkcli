var Jasmine = require('jasmine');
var path = require('path');
var HtmlReporter = require('jasmine-pretty-html-reporter').Reporter;
var jasmine = new Jasmine();

jasmine.loadConfigFile('./spec/support/jasmine.json');

// options object
jasmine.addReporter(new HtmlReporter({
  path: path.join(__dirname, 'results')
}));

console.log('=======================\n========== open:      http://localhost:8080/report.html\n=======================');
jasmine.execute();