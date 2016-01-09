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
var Docker = require('docker-cli-js');
var path = require('path');
var moment = require('moment');
var JSONPath = require('JSONPath');
var _ = require('lodash');

module.exports = function (options, callback) {
  var debug = require('debug')('solr-zkcli:lib/index.js main');

  return Promise.resolve().then(function () {
    //debug('options = ', options);
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

  var cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.confdir),
    util.format(' -d solr ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /opt/solr/server/solr/configsets '
  ];

  return zkcliViaDocker(cmdArray);
};


var zkcliViaDocker = function (cmdArray) {
  var debug = require('debug')('solr-zkcli:lib/index.js zkcliViaDocker');

  var docker = new Docker({});
  var containerid;
  var error = '';

  return Promise.resolve().then(function () {

    var command = cmdArray.join('');
    //debug('command', command);

    return docker.command(command);
  }).then(function (data) {
    //debug('data', data);
    containerid = data.containerId;
    //return Promise.delay(1000);

    return waitForContainerToFinish(containerid);
  }).then(function () {

    return docker.command('logs ' + containerid);

  }).then(function (data2) {
    //debug('data2', data2);
    if (!data2.raw) {
      error += 'docker logs failed !data2.raw ';
    } else {
      var obj = JSON.parse(data2.raw);

      //failed if logs returns data
      error += obj[0].trim();
    }

  }).then(function () {
    if (containerid) {
      return docker.command('rm -f ' + containerid);
    }

  }).then(function (data3) {
    //debug('data3', data3);

    if (!data3.raw) {
      error += 'docker rm -f failed !data3.raw ';
    } else {
      var obj = JSON.parse(data3.raw);
      var id = obj[0].trim();
      //debug('id "%s"', id);
      //debug('containerid "%s"', containerid);
      if (id !== containerid) {
        throw 'failed to remove docker container ' + data3.raw;
      }
    }

   

    var result = {
      ok: error.length === 0
    };

    if (!result.ok) {
      result.error = error;
    }
    //debug('result', result);
    return result;
  }).catch(function (e) {
    debug('error', e);
    return {
      ok: false,
      error: error + ' ' + e
    };
  });


};


var waitForContainerToFinish = function (containerid, options) {
  var debug = require('debug')('solr-zkcli:lib/index.js waitForContainerToFinish');
  containerid = containerid.substring(0, 12);

  if (!options) {
    options = {};
  }

  options.timeoutInSeconds = options.timeoutInSeconds || 15;
  options.checkIntervalInMilliSeconds = options.checkIntervalInMilliSeconds || 500;

  options.internalUseOnly = options.internalUseOnly || {
    startTime: moment(),
    endTime: moment().add(options.timeoutInSeconds, 's')
  };



  //debug('options', options);

  var now = moment();

  //debug('now', now.format());
  var diff = now.valueOf() - options.internalUseOnly.startTime.valueOf();
  debug('diff ms', diff);

  if (now.isSameOrBefore(options.internalUseOnly.endTime)) {
    return Promise.delay(options.checkIntervalInMilliSeconds).then(function () {

      var docker = new Docker({});

      return docker.command('ps');
    }).then(function (data) {
      //debug('data.containerList', data.containerList);
      //'$.*[?(@.names="zookeeper")]'
      var result = JSONPath({ json: data.containerList, path: '$.*.container id' });
      var stillRunning = _.contains(result, containerid);
      //debug('result', result);
      //debug('stillRunning', stillRunning);

      if (stillRunning) {
        return waitForContainerToFinish(containerid, options);
      }

    });
  }

  return Promise.resolve().then(function () {

    var docker = new Docker({});

    return docker.command('rm -f ' + containerid);
  }).then(function (data) {
    debug('data', data);
    throw 'ERROR timeout';
  });




};
