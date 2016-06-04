import * as _ from 'lodash';
//import * as child_process from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as moment from 'moment';
import { Docker } from 'docker-cli-js';
import nodeify from 'nodeify-ts';
const promiseDelay = require('promise-delay');
const JSONPath = require('jsonpath-plus');

//const exec2 = child_process.exec;


const waitForContainerToFinish = function (containerid: string, options?) {
  containerid = containerid.substring(0, 12);

  if (!options) {
    options = {};
  }

  options.timeoutInSeconds = options.timeoutInSeconds || 15;
  options.checkIntervalInMilliSeconds = options.checkIntervalInMilliSeconds || 500;

  options.internalUseOnly = options.internalUseOnly || {
    endTime: moment().add(options.timeoutInSeconds, 's'),
    startTime: moment(),
  };



  //console.log('options', options);

  const now = moment();

  //console.log('now', now.format());
  //const diff = now.valueOf() - options.internalUseOnly.startTime.valueOf();
  //console.log('diff ms', diff);

  if (now.isBefore(options.internalUseOnly.endTime)) {
    return Promise.resolve().then(function () {
      return promiseDelay(options.checkIntervalInMilliSeconds);
    }).then(function () {
      const docker = new Docker();

      return docker.command('ps');
    }).then(function (data) {
      //console.log('data.containerList', data.containerList);
      //'$.*[?(@.names="zookeeper")]'      
      const result = JSONPath({ json: data.containerList, path: '$.*.container id' });
      const stillRunning = _.contains(result, containerid);
      //console.log('result', result);
      //console.log('stillRunning', stillRunning);

      if (stillRunning) {
        return waitForContainerToFinish(containerid, options);
      }

    });
  }

  return Promise.resolve().then(function () {

    const docker = new Docker();

    return docker.command('rm -f ' + containerid);
  }).then(function (data) {
    //console.log('data', data);
    throw 'ERROR timeout';
  });
};


const zkcliViaDocker = function (cmdArray, cmd?) {
  const docker = new Docker();
  let containerid;
  let error = '';
  let returned_data = '';

  return Promise.resolve().then(function () {

    const command = cmdArray.join('');

    return docker.command(command);
  }).then(function (data) {
    containerid = data.containerId;
    //return Promise.delay(10000);

    return waitForContainerToFinish(containerid);
  }).then(function () {
    const command2 = 'logs ' + containerid;
    return docker.command(command2);

  }).then(function (data2) {

    if (!data2 || !data2.raw) {
      error += 'docker logs failed !data2 ';
    } else {
      const obj = JSON.parse(data2.raw);

      if (cmd === 'get') {
        returned_data = obj[0].trim();
      } else if (cmd === 'list') {
        returned_data = obj[0].trim().split(os.EOL);
      } else {
        //failed if logs returns data
        error += obj[0].trim();

        const lines = obj[1].split(os.EOL);
        //const foundException = false;
        lines.forEach(function (line) {
          if (_.startsWith(line, 'Exception')) {
            //foundException = true;
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
      const obj = JSON.parse(data3.raw);
      const id = obj[0].trim();

      if (id !== containerid) {
        throw 'failed to remove docker container ' + data3.raw;
      }
    }

    const result = {
      error: null,
      ok: error.length === 0,
      returnedData: null,
    };

    if (!result.ok) {
      result.error = error;
    }

    if (returned_data) {
      result.returnedData = returned_data;
    }

    //console.log('result', result);
    return result;
  }).catch(function (e) {
    return {
      error: error + ' ' + e,
      ok: false,
      returnedData: returned_data,
    };
  });


};



const clusterprop = function (options) {

  const cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd clusterprop '),
    util.format(' -name %s', options.name),
    util.format(' -val %s', options.val),
  ];

  return zkcliViaDocker(cmdArray);
};


const makepath = function (options) {

  const cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray);
};

//Exception in thread "main" org.apache.solr.common.SolrException: solr.xml does not exist in 
///opt/solr / server / solr / configsets cannot start Solr
//const linkconfig = function (options) {
//  const console.log = require('console.log')('solr-zkcli:lib/index.js linkconfig');

//  const cmdArray = [
//    util.format('run-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
//    ' -cmd linkconfig ',
//    util.format(' -collection %s ', options.collection),
//    util.format(' -confname %s ', options.confname)
//  ];

//  return zkcliViaDocker(cmdArray);
//};


const put = function (options) {

  const cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray);
};

const get = function (options) {

  const cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray, 'get');
};


const list = function (options) {

  const cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray, 'list');
};

const clear = function (options) {

  const cmdArray = [
    util.format('run --net host '),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray);
};



const getfile = function (options) {

  const cmdParts = options.cmd.split(' ');
  const zkPath = cmdParts[1];
  const filePath = cmdParts[2];
  const filePathDirname = path.dirname(filePath);
  const fileName = path.basename(filePath);

  console.log('filePathDirname', filePathDirname);
  console.log('fileName', fileName);

  const cmdArray = [
    util.format('run --net host -v %s:/const/opt ', filePathDirname),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s ', options.zkhost),
    util.format(' -cmd getfile %s /const/opt/%s ', zkPath, fileName),
  ];

  return zkcliViaDocker(cmdArray, 'getfile');
};

const putfile = function (options) {

  const cmdParts = options.cmd.split(' ');
  const zkPath = cmdParts[1];
  const filePath = cmdParts[2];
  const filePathDirname = path.dirname(filePath);
  const fileName = path.basename(filePath);


  const cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', filePathDirname),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd putfile %s /opt/solr/server/solr/configsets/%s', zkPath, fileName),
  ];

  return zkcliViaDocker(cmdArray);
};


const bootstrap = function (options) {

  const cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.solrhome),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    ' -cmd bootstrap ',
    ' -solrhome /opt/solr/server/solr/configsets ',
  ];

  return zkcliViaDocker(cmdArray);
};


const upconfig = function (options) {

  const cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.confdir),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /opt/solr/server/solr/configsets ',
  ];

  return zkcliViaDocker(cmdArray);
};


const downconfig = function (options) {

  const cmdArray = [
    util.format('run --net host -v %s:/const/opt ', options.confdir),
    util.format('-d quobjectio/solr:1.0.0 ./server/scripts/cloud-scripts/zkcli.sh -zkhost %s', options.zkhost),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /const/opt ',
  ];

  return zkcliViaDocker(cmdArray);
};


export function exec (options: Options, callback?: (err, data) => void)  {

  const promise = Promise.resolve().then(function () {
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

  });

  return nodeify(promise, callback);
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
    // tslint:disable-next-line: no-shadowed-variable
    public clusterprop?: { name: string, val: string }
  ) { }
}

