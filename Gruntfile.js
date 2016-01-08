var path = require('path');
var strip_json = require('strip-json-comments');
var fs = require('fs');
var util = require('util');





module.exports = function (grunt) {   
  var debug = require('debug')('solr-zkcli:Gruntfile.js');
  var config = JSON.parse(strip_json(String(fs.readFileSync(path.join(__dirname, 'config.json')))));
  debug('config', config);

  grunt.initConfig({
    config: config,
    shell: {
      exec: {
        options: {
          stdout: true,
          stderr: true
        }
      }
    },
    jshint: {
      options: {
        jshintrc: true,
      },
      target1: [
        'Gruntfile.js',
        './lib/**/*.js',
        './test/**/*.js'
      ]
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          bail: true,
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
        },
        src: ['./test/**/*.js']
      }
    },  

  });

  grunt.loadTasks('./tasks');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('default', ['jshint', 'mochaTest']);
};
