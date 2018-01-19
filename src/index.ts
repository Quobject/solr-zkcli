import * as path from 'path';
import * as util from 'util';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Docker } from 'docker-cli-js';
import nodeify from 'nodeify-ts';
const promiseDelay = require('promise-delay');
const JSONPath = require('jsonpath-plus');

//const exec2 = child_process.exec;

class WaitForContainerToFinishOptions {
  public internalUseOnly: { endTime: moment.Moment, startTime: moment.Moment };

  public constructor(
    public timeoutInSeconds: number = 15,
    public checkIntervalInMilliSeconds: number = 500,
  ) {
    this.internalUseOnly = {
      endTime: moment().add(timeoutInSeconds, 's'),
      startTime: moment(),
    };
  }
}

const waitForContainerToFinish = function (containerid: string,
  options: WaitForContainerToFinishOptions = new WaitForContainerToFinishOptions()): Promise<void> {
  containerid = containerid.substring(0, 12);

  if (!options) {
    options = new WaitForContainerToFinishOptions();
  }

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
      const stillRunning = _.includes(result, containerid);
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
    throw new Error('ERROR timeout');
  });
};

export class SolrZkcliResult {
  public constructor(
    public error = '',
    public ok = false,
    public returnedData = '',
  ) {
  }
}

const zkcliViaDocker = function (cmdArray: Array<string>, cmd: string = ''): Promise<SolrZkcliResult> {
  const docker = new Docker();
  let containerid: string;
  let error = '';
  let returned_data = '';

  return Promise.resolve().then(function () {
    const command = cmdArray.join('');
    console.log('zkcliViaDocker command', command);

    return docker.command(command);
  }).then(function (data) {
    console.log('zkcliViaDocker data', data);
    containerid = data.containerId;
    //return Promise.delay(10000);

    return waitForContainerToFinish(containerid);
  }).then(function () {
    const command2 = 'logs ' + containerid;
    return docker.command(command2);
  }).then(function (data2) {
    console.log('zkcliViaDocker data2', data2);

    if (!data2) {
      error += 'docker logs failed !data2 ';
    } else {
      //if (data2.raw === '') {
      //  data2.raw = '{}';
      //}

      //const obj = JSON.parse(data2.raw);

      if (cmd === 'get') {
        returned_data = data2.raw;
      } else if (cmd === 'list' || cmd === 'mkroot') {
        returned_data = data2.raw; 
      } else {
        //failed if logs returns data
        error += data2.raw;

        //const lines = obj.split(os.EOL);
        ////const foundException = false;
        //lines.forEach(function (line) {
        //  if (_.startsWith(line, 'Exception')) {
        //    //foundException = true;
        //    error += line;
        //  }
        //});
      }
    }
  }).then(function () {
    //console.log('error 0', error);

    if (containerid) {
      return docker.command('rm -f ' + containerid);
    }
  }).then(function (data3) {
    //console.log('data3', data3);

    if (!data3 || !data3.raw) {
      error += 'docker rm -f failed !data3.raw ';
    } else {
      const id = data3.raw.trim();

      if (id !== containerid) {
        throw new Error('failed to remove docker container ' + data3.raw);
      }
    }

    const result = new SolrZkcliResult(error, error.length === 0, returned_data);
    //console.log('error 1', error);
    //console.log('result', result);

    return result;
  }).catch(function (e) {
    //console.log('error 2', error);
    return new SolrZkcliResult(error + ' ' + e, false, returned_data);
  });
};

const clusterprop = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommand(),
    util.format(' -cmd clusterprop '),
  ];

  if (options.clusterprop) {
    cmdArray.push(util.format(' -name %s', options.clusterprop.name));
    cmdArray.push(util.format(' -val %s', options.clusterprop.val));
  }

  return zkcliViaDocker(cmdArray);
};

const makepath = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommand(),
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

const put = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommand(),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray);
};

const get = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommand(),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray, 'get');
};

const list = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommand(),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray, 'list');
};

const clear = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommand(),
    util.format(' -cmd %s', options.cmd),
  ];

  return zkcliViaDocker(cmdArray);
};

const getfile = function (options: SolrZkcliOptions) {
  const cmdParts = options.cmd.split(' ');
  const zkPath = cmdParts[1];
  const filePath = cmdParts[2];
  const filePathDirname = path.dirname(filePath);
  const fileName = path.basename(filePath);

  console.log('filePathDirname', filePathDirname);
  console.log('fileName', fileName);

  const cmdArray = [
    util.format('run --net host -v %s:/const/opt ', filePathDirname),
    options.BaseCommand(),
    util.format(' -cmd getfile %s /const/opt/%s ', zkPath, fileName),
  ];

  return zkcliViaDocker(cmdArray, 'getfile');
};

const putfile = function (options: SolrZkcliOptions) {
  const cmdParts = options.cmd.split(' ');
  const zkPath = cmdParts[1];
  const filePath = cmdParts[2];
  const filePathDirname = path.dirname(filePath);
  const fileName = path.basename(filePath);

  const cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', filePathDirname),
    options.BaseCommand(),
    util.format(' -cmd putfile %s /opt/solr/server/solr/configsets/%s', zkPath, fileName),
  ];

  return zkcliViaDocker(cmdArray);
};

const bootstrap = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.solrhome),
    options.BaseCommand(),
    ' -cmd bootstrap ',
    ' -solrhome /opt/solr/server/solr/configsets ',
  ];

  return zkcliViaDocker(cmdArray);
};

const upconfig = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host -v %s:/opt/solr/server/solr/configsets ', options.confdir),
    options.BaseCommand(),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /opt/solr/server/solr/configsets ',
  ];

  return zkcliViaDocker(cmdArray);
};

const downconfig = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host -v %s:/const/opt ', options.confdir),
    options.BaseCommand(),
    util.format(' -cmd %s ', options.cmd),
    util.format(' -confname %s ', options.confname),
    ' -confdir /const/opt ',
  ];

  return zkcliViaDocker(cmdArray);
};

const mkroot = function (options: SolrZkcliOptions) {
  const cmdArray = [
    util.format('run --net host '),
    options.BaseCommandSolr(),
    util.format(` mkroot /${options.confname} `),
    util.format(` -z ${options.zkhost} `),
  ];

  return zkcliViaDocker(cmdArray, 'mkroot');
};

export function SolrZkCliCommand(options: SolrZkcliOptions, callback?: (err: string, data: string) => void) {
  const promise = Promise.resolve().then(function () {
    if (!options) {
      throw new Error('need options object');
    }

    options.cmd = options.cmd.trim();

    if (options.cmd === 'upconfig') {
      return upconfig(options);
    }

    if (options.cmd === 'upconfig2') {
      return upconfig2(options);
    }

    if (options.cmd === 'downconfig') {
      return downconfig(options);
    }

    if (options.cmd === 'bootstrap') {
      return bootstrap(options);
    }

    if (options.cmd.startsWith('put ')) {
      return put(options);
    }

    if (options.cmd.startsWith('get ')) {
      return get(options);
    }

    if (options.cmd.startsWith('putfile ')) {
      return putfile(options);
    }

    if (options.cmd.startsWith('list')) {
      return list(options);
    }

    if (options.cmd.startsWith('clear')) {
      return clear(options);
    }

    if (options.cmd.startsWith('getfile ')) {
      return getfile(options);
    }

    //if (options.cmd === 'linkconfig') {
    //  return bootstrap(options);
    //}

    if (options.cmd.startsWith('makepath ')) {
      return makepath(options);
    }

    if (options.cmd === 'clusterprop') {
      return clusterprop(options);
    }

    if (options.cmd === 'mkroot') {
      return mkroot(options);
    }

    throw new Error('options.cmd ' + options.cmd + ' not implemented');
  });

  return nodeify(promise, callback);
}

export class SolrZkcliOptions {
  public constructor(
    public cmd: string,
    public currentWorkingDirectory?: string,
    public zkhost?: string,
    public confname?: string,
    public confdir?: string,
    // tslint:disable-next-line: no-shadowed-variable
    public clusterprop?: { name: string, val: string },
    public solrhome?: string,
    public solrDockerImage = 'solr:7.2.0',
  ) { }

  public BaseCommand(): string {
    return ` -d ${this.solrDockerImage} ./server/scripts/cloud-scripts/zkcli.sh -zkhost ${this.zkhost} `;
  }

  public BaseCommandSolr(): string {
    return ` -d ${this.solrDockerImage} ./bin/solr zk `;
  }
}
