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

module.exports = function (options, callback) {
  var debug = require('debug')('solr-zkcli:lib/index.js main');

  return Promise.resolve().then(function () {
    debug('options = ', options);
    if (!options) {
      throw 'need options object';
    }
    
    throw 'todo';
    //return new Promise(function (resolve, reject) {
     
    
    //});
    

  }).then(function (data) {


  }).finally(function () {
  }).nodeify(callback);
};


