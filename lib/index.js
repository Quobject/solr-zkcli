/**
* Copyright 2016 Matthias Ludwig
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/
'use strict';

var Promise = require("bluebird");
var util = require('util');
var _ = require('lodash');
var Docker = require('docker-cli-js');
var path = require('path');


module.exports = function (options, callback) {
  var debug = require('debug')('solr-zkcli:lib/index.js main');

  return Promise.resolve().then(function () {
    debug('options = ', options);
    if (!options) {
      throw 'need options object';
    }
    
    if (options.cmd === 'upconfig') {
      return upconfig(options);
    }
    throw 'options.cmd ' + options.cmd + ' not implemented';   

  }).then(function (data) {
    return data;
  }).finally(function () {
  }).nodeify(callback);
};

var upconfig = function (options) {
  var debug = require('debug')('solr-zkcli:lib/index.js upconfig');
  var docker = new Docker({});

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

  return Promise.resolve().then(function () {
    return docker.command(command);
  }).then(function (data) {
    return data;
  }).catch(function (e) {
    return e;
  }).finally(function () {
    return 'doneee';
  });






};


