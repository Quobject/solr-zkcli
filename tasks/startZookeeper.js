var Promise = require("bluebird");
var Docker = require('docker-cli-js');
var util = require('util');

module.exports = function (grunt) {

  grunt.registerTask('startZookeeper', 'startZookeeper', function () {
    var debug = require('debug')('solr-zkcli:tasks/startZookeeper.js');
    var config = grunt.config('config');
    var done = this.async();
    
    Promise.resolve().then(function () {
      var docker = new Docker({});

      var cmd = util.format('run --name zookeeper -d -p %s:2181 jplock/zookeeper', config.zkport);
      debug('cmd', cmd);
      return docker.command(cmd);

    }).then(function (data) {
      debug('data', data);
    }).finally(function () {
      debug('finally');
      done();
    });

  });
};
