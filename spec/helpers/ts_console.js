const TSConsoleReporter = require("jasmine-ts-console-reporter");
const jasmineReporters = require("jasmine-reporters");

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new TSConsoleReporter());
