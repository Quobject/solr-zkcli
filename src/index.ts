import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as child_process from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as moment from 'moment';
import { Docker, Options as DockerOptions} from 'docker-cli-js';
const JSONPath = require('jsonpath-plus');
const exec2 = child_process.exec;


var waitForContainerToFinish = function (containerid: string, options?) {
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
  //debug('diff ms', diff);

  if (now.isBefore(options.internalUseOnly.endTime)) {
    return Promise.delay(options.checkIntervalInMilliSeconds).then(function () {

      var docker = new Docker();

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

    var docker = new Docker();

    return docker.command('rm -f ' + containerid);
  }).then(function (data) {
    //debug('data', data);
    throw 'ERROR timeout';
  });
};


var zkcliViaDocker = function (cmdArray, cmd?) {
  var docker = new Docker();
  var containerid;
  var error = '';
  var returned_data = '';

  return Promise.resolve().then(function () {

    var command = cmdArray.join('');

    return docker.command(command);
  }).then(function (data) {
    containerid = data.containerId;
    //return Promise.delay(10000);

    return waitForContainerToFinish(containerid);
  }).then(function () {
    var command2 = 'logs ' + containerid;
    return docker.command(command2);

  }).then(function (data2) {

    if (!data2 || !data2.raw) {
      error += 'docker logs failed !data2 ';
    } else {
      var obj = JSON.parse(data2.raw);

      if (cmd === 'get') {
        returned_data = obj[0].trim();
      } else if (cmd === 'list') {
        returned_data = obj[0].trim().split(os.EOL);
      } else {
        //failed if logs returns data
        error += obj[0].trim();

        var lines = obj[1].split(os.EOL);
        var foundException = false;
        lines.forEach(function (line) {
          if (_.startsWith(line, 'Exception')) {
            var foundException = true;
            error += line;
          }
        });
      }

    }

  }).then(function () {
    if (containerid) {
      return docker.command('rm -f ' + containerid);
    }

  }).then(function (data3) {

    if (!data3 || !data3.raw) {
      error += 'docker rm -f failed !data3.raw ';
    } else {
      var obj = JSON.parse(data3.raw);
      var id = obj[0].trim();

      if (id !== containerid) {
        throw 'failed to remove docker container ' + data3.raw;
      }
    }

    var result = {
      ok: error.length === 0,
      error: null,
      returnedData: null,
    };

    if (!result.ok) {
      result.error = error;
    }

    if (returned_data) {
      result.returnedData = returned_data;
    }

    //debug('result', result);
    return result;
  }).catch(function (e) {
    return {
      ok: false,
      returnedData: returned_data,
      error: error + ' ' + e
    };
  });


};



var clusterprop = function (options) {

  var cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd clusterprop '),
    util.format(' -name %s', options.name),
    util.format(' -val %s', options.val),
  ];

  return zkcliViaDocker(cmdArray);
};


var makepath = function (options) {

  var cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd)
  ];

  return zkcliViaDocker(cmdArray);
};

//Exception in thread "main" org.apache.solr.common.SolrException: solr.xml does not exist in /opt/solr/server/solr/configsets cannot start Solr
//var linkconfig = function (options) {
//  var debug = require('debug')('solr-zkcli:lib/index.js linkconfig');

//  var cmdArray = [
//    util.format('run-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
//    ' -cmd linkconfig ',
//    util.format(' -collection %s ', options.collection),
//    util.format(' -confname %s ', options.confname)
//  ];

//  return zkcliViaDocker(cmdArray);
//};


var put = function (options) {

  var cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd)
  ];

  return zkcliViaDocker(cmdArray);
};

var get = function (options) {

  var cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd)
  ];

  return zkcliViaDocker(cmdArray, 'get');
};


var list = function (options) {

  var cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd)
  ];

  return zkcliViaDocker(cmdArray, 'list');
};

var clear = function (options) {

  var cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd)
  ];

  return zkcliViaDocker(cmdArray);
};



var getfile = function (options) {

  var cmdParts = options.cmd.split(' ');
  var zkPath = cmdParts[1];
  var filePath = cmdParts[2];
  var filePathDirname = path.dirname(filePath);
  var fileName = path.basename(filePath);

  debug('filePathDirname', filePathDirname);
  debug('fileName', fileName);

  var cmdArray = [
    util.format('run --net host -v %s:/var/opt ', filePathDirname),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd getfile %s /var/opt/%s ', zkPath, fileName)
  ];

  return zkcliViaDocker(cmdArray, 'getfile');
};

var putfile = function (options) {

  var cmdParts = options.cmd.split(' ');
  var zkPath = cmdParts[1];
  var filePath = cmdParts[2];
  var filePathDirname = path.dirname(filePath);
  var fileName = path.basename(filePath);


  var cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', filePathDirname),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd putfile %s /opt/solr/server/solr/configsets/%s', zkPath, fileName)
  ];

  return zkcliViaDocker(cmdArray);
};


var bootstrap = function (options) {

  var cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.solrhome),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    ' -cmd bootstrap ',
    ' -solrhome /opt/solr/server/solr/configsets '
  ];

  return zkcliViaDocker(cmdArray);
};


var upconfig = function (options) {

  var cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.confdir),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /opt/solr/server/solr/configsets '
  ];

  return zkcliViaDocker(cmdArray);
};


var downconfig = function (options) {

  var cmdArray = [
    util.format('run --net host -v %s:/var/opt ', options.confdir),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /var/opt '
  ];

  return zkcliViaDocker(cmdArray);
};









export function exec (options: Options, callback?: (err, data) => void)  {

  return Promise.resolve().then(function () {
    if (!options) {
      throw 'need options object';
    }

    if (options.cmd === 'upconfig') {
      return upconfig(options);
    }

    if (options.cmd === 'downconfig') {
      return downconfig(options);
    }

    if (options.cmd === 'bootstrap') {
      return bootstrap(options);
    }

    if (_.startsWith(options.cmd.trim(), 'put ')) {
      return put(options);
    }

    if (_.startsWith(options.cmd.trim(), 'get ')) {
      return get(options);
    }

    if (_.startsWith(options.cmd.trim(), 'putfile ')) {
      return putfile(options);
    }

    if (_.startsWith(options.cmd.trim(), 'list')) {
      return list(options);
    }

    if (_.startsWith(options.cmd.trim(), 'clear')) {
      return clear(options);
    }

    if (_.startsWith(options.cmd.trim(), 'getfile ')) {
      return getfile(options);
    }

    //if (options.cmd === 'linkconfig') {
    //  return bootstrap(options);
    //}

    if (_.startsWith(options.cmd.trim(), 'makepath ')) {
      return makepath(options);
    }

    if (options.cmd === 'clusterprop') {
      return clusterprop(options);
    }

    throw 'options.cmd ' + options.cmd + ' not implemented';

  }).nodeify(callback);

}


export interface IOptions {
  cmd: string;
  currentWorkingDirectory?: string;
  zkhost?: string;
  confname?: string;
  confdir?: string;
  clusterprop?: { name: string, val: string };
}

export class Options implements IOptions {
  public constructor(
    public cmd: string,
    public currentWorkingDirectory?: string,
    public zkhost?: string,
    public confname?: string,
    public confdir?: string,
    public clusterprop?: { name: string, val: string }
  ) { }
}

