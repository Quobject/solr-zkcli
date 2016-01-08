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

var solrZkcli = require('../lib/index.js');
var Promise = require("bluebird");
var path = require('path');
var should = require('chai').should();
var assert = require('chai').assert;
var util = require('util');
var debug = require('debug')('zookeeper-commands:test/index.js');



describe('solrZkcli', function () {

 

  //it('should allow only four letters', function (done) {
  //  this.timeout(1 * 60 * 1000);//1 minute

  //  var promises = [];

  //  [null, '', 'a', 'aaa', 'aaaaa'].forEach(function (item) {
  //    debug('command = ', item);
  //    var error;
  //    var zookeeperCommands = new ZookeeperCommands({
  //      host: HOST,
  //      port: PORT
  //    });
  //    var promise = zookeeperCommands.command(item).then(function (data) {
  //      console.log('data = ', util.inspect(data, { depth: 10 }));
  //      assert.isNotNull(data);
  //      done();
  //    }).catch(function (error2) {
  //      debug('error = ' + error2);
  //      error = error2;
  //    }).finally(function () {
  //      assert.equal(error, 'Each command must be composed of four letters https://zookeeper.apache.org/doc/r3.4.6/zookeeperAdmin.html#sc_zkCommands');
  //      debug('finally');
  //    });

  //    promises.push(promise);

  //  });

  //  Promise.all(promises).then(function () {
  //    done();
  //  });
  //});



});


