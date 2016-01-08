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
/*global describe, it, before */
var solrZkcli = require('../lib/index.js');
var Promise = require("bluebird");
var path = require('path');
var should = require('chai').should();
var assert = require('chai').assert;
var util = require('util');
var debug = require('debug')('solr-zkcli:test/index.js');
var Promise = require("bluebird");
var strip_json = require('strip-json-comments');
var fs = require('fs');


var config = JSON.parse(strip_json(String(fs.readFileSync(path.join(__dirname,'..', 'config.json')))));
debug('config', config);

describe('solrZkcli', function () {

  it('upconfig', function (done) {

    Promise.resolve().then(function () {
   

      var options = {
        zkhost: '127.0.0.1:' + config.zkport,
        cmd: 'upconfig',
        confname: 'my_new_config4',
        confdir: path.join(__dirname, '..', 'test', 'solr', 'fmlogs', 'conf2')
      };
    
      return solrZkcli(options);

    }).then(function (data) {
      debug('data', data);
    }).finally(function () {
      debug('finally');
      done();
    });

  });

});


