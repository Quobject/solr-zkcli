var _ = require('lodash');
var Promise = require("bluebird");
var Docker = require('docker-cli-js');
var util = require('util');
var path = require('path');

module.exports = function (grunt) {

  grunt.registerTask('upconfig', 'upconfig', function () {
    var debug = require('debug')('solr-zkcli:tasks/upconfig.js');
    var config = grunt.config('config');
    var done = this.async();
    
    Promise.resolve().then(function () {
      var docker = new Docker({});
      var options = {
        zkhost: '127.0.0.1:' + config.zkport,
        cmd: 'upconfig',
        confname: 'my_new_config3',
        confdir: path.join(__dirname, '..', 'test', 'solr', 'fmlogs', 'conf')
      };
      
      var cmdArray = [
        util.format(' run --net host -v %s:/opt/solr/server/solr/configsets ', options.confdir),
        util.format(' --rm solr ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
        util.format(' -cmd %s ', options.cmd),
        util.format(' -confname %s ', options.confname),
        ' -confdir /opt/solr/server/solr/configsets '
      ];
      //debug('cmdArray', cmdArray);

      var command = cmdArray.join('');
      debug('command', command);

      return docker.command(command);

    }).then(function (data) {
      debug('data', data);
    }).finally(function () {
      debug('finally');
      done();
    });

  });
};
