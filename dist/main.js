"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const moment_1 = __importDefault(require("moment"));
const _ = __importStar(require("lodash"));
const docker_cli_js_1 = require("docker-cli-js");
const nodeify_ts_1 = __importDefault(require("nodeify-ts"));
const promiseDelay = require('promise-delay');
//const JSONPath = require('jsonpath-plus');
const jsonpath_plus_1 = require("jsonpath-plus");
//const exec2 = child_process.exec;
class WaitForContainerToFinishOptions {
    constructor(timeoutInSeconds = 15 * 60, checkIntervalInMilliSeconds = 1000) {
        this.timeoutInSeconds = timeoutInSeconds;
        this.checkIntervalInMilliSeconds = checkIntervalInMilliSeconds;
        this.internalUseOnly = {
            endTime: moment_1.default().add(timeoutInSeconds, 's'),
            startTime: moment_1.default(),
        };
    }
}
const waitForContainerToFinish = function (containerid, machinename = 'localhost', options = new WaitForContainerToFinishOptions()) {
    containerid = containerid.substring(0, 12);
    if (!options) {
        options = new WaitForContainerToFinishOptions();
    }
    const now = moment_1.default();
    //console.log('now', now.format());
    //const diff = now.valueOf() - options.internalUseOnly.startTime.valueOf();
    //console.log('diff ms', diff);
    if (now.isBefore(options.internalUseOnly.endTime)) {
        return Promise.resolve().then(function () {
            return promiseDelay(options.checkIntervalInMilliSeconds);
        }).then(function () {
            const dockeroptions = new docker_cli_js_1.Options(
            /* machinename */ machinename === 'localhost' ? undefined : machinename, 
            /* currentWorkingDirectory */ undefined);
            const docker = new docker_cli_js_1.Docker(dockeroptions);
            return docker.command('ps');
        }).then(function (data) {
            //console.log('data.containerList', data.containerList);
            //'$.*[?(@.names="zookeeper")]'
            const result = jsonpath_plus_1.JSONPath({ json: data.containerList, path: '$.*.container id' });
            const stillRunning = _.includes(result, containerid);
            //console.log('result', result);
            //console.log('stillRunning', stillRunning);
            if (stillRunning) {
                return waitForContainerToFinish(containerid, machinename, options);
            }
        });
    }
    return Promise.resolve().then(function () {
        const dockeroptions = new docker_cli_js_1.Options(
        /* machinename */ machinename === 'localhost' ? undefined : machinename, 
        /* currentWorkingDirectory */ undefined);
        const docker = new docker_cli_js_1.Docker(dockeroptions);
        return docker.command('rm -f ' + containerid);
    }).then(function (data) {
        //console.log('data', data);
        throw new Error('ERROR timeout');
    });
};
class SolrZkcliResult {
    constructor(error = '', ok = false, returnedData = '') {
        this.error = error;
        this.ok = ok;
        this.returnedData = returnedData;
    }
}
exports.SolrZkcliResult = SolrZkcliResult;
const zkcliViaDocker = function (options, cmdArray, cmd = '') {
    const docker = new docker_cli_js_1.Docker();
    let containerid;
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
        }
        else {
            //if (data2.raw === '') {
            //  data2.raw = '{}';
            //}
            //const obj = JSON.parse(data2.raw);
            if (cmd === 'get') {
                returned_data = data2.raw;
            }
            else if (cmd === 'list' || cmd === 'mkroot') {
                returned_data = data2.raw;
            }
            else {
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
        }
        else {
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
const clusterprop = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommand(),
        util.format(' -cmd clusterprop '),
    ];
    if (options.clusterprop) {
        cmdArray.push(util.format(' -name %s', options.clusterprop.name));
        cmdArray.push(util.format(' -val %s', options.clusterprop.val));
    }
    return zkcliViaDocker(options, cmdArray);
};
const makepath = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommand(),
        util.format(' -cmd %s', options.cmd),
    ];
    return zkcliViaDocker(options, cmdArray);
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
//  return zkcliViaDocker(options, cmdArray);
//};
const put = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommand(),
        util.format(' -cmd %s', options.cmd),
    ];
    return zkcliViaDocker(options, cmdArray);
};
const get = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommand(),
        util.format(' -cmd %s', options.cmd),
    ];
    return zkcliViaDocker(options, cmdArray, 'get');
};
const list = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommand(),
        util.format(' -cmd %s', options.cmd),
    ];
    return zkcliViaDocker(options, cmdArray, 'list');
};
const clear = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommand(),
        util.format(' -cmd %s', options.cmd),
    ];
    return zkcliViaDocker(options, cmdArray);
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
        util.format(`run --net ${options.network} -v %s:/const/opt `, filePathDirname),
        options.BaseCommand(),
        util.format(' -cmd getfile %s /const/opt/%s ', zkPath, fileName),
    ];
    return zkcliViaDocker(options, cmdArray, 'getfile');
};
const putfile = function (options) {
    const cmdParts = options.cmd.split(' ');
    const zkPath = cmdParts[1];
    const filePath = cmdParts[2];
    const filePathDirname = path.dirname(filePath);
    const fileName = path.basename(filePath);
    const cmdArray = [
        util.format(`run --net ${options.network} -v %s:/opt/solr/server/solr/configsets `, filePathDirname),
        options.BaseCommand(),
        util.format(' -cmd putfile %s /opt/solr/server/solr/configsets/%s', zkPath, fileName),
    ];
    return zkcliViaDocker(options, cmdArray);
};
const bootstrap = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} -v %s:/opt/solr/server/solr/configsets `, options.solrhome),
        options.BaseCommand(),
        ' -cmd bootstrap ',
        ' -solrhome /opt/solr/server/solr/configsets ',
    ];
    return zkcliViaDocker(options, cmdArray);
};
const upconfig = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} -v %s:/opt/solr/server/solr/configsets `, options.confdir),
        options.BaseCommand(),
        util.format(' -cmd %s ', options.cmd),
        util.format(' -confname %s ', options.confname),
        ' -confdir /opt/solr/server/solr/configsets ',
    ];
    return zkcliViaDocker(options, cmdArray);
};
const downconfig = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} -v %s:/const/opt `, options.confdir),
        options.BaseCommand(),
        util.format(' -cmd %s ', options.cmd),
        util.format(' -confname %s ', options.confname),
        ' -confdir /const/opt ',
    ];
    return zkcliViaDocker(options, cmdArray);
};
const mkroot = function (options) {
    const cmdArray = [
        util.format(`run --net ${options.network} `),
        options.BaseCommandSolr(),
        util.format(` mkroot /${options.confname} `),
        util.format(` -z ${options.zkhost} `),
    ];
    return zkcliViaDocker(options, cmdArray, 'mkroot');
};
function SolrZkCliCommand(options, callback) {
    const promise = Promise.resolve().then(function () {
        if (!options) {
            throw new Error('need options object');
        }
        options.cmd = options.cmd.trim();
        if (options.cmd === 'upconfig') {
            return upconfig(options);
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
    return nodeify_ts_1.default(promise, callback);
}
exports.SolrZkCliCommand = SolrZkCliCommand;
class SolrZkcliOptions {
    constructor(cmd, currentWorkingDirectory, zkhost, confname, confdir, 
    // tslint:disable-next-line: no-shadowed-variable
    clusterprop, solrhome, solrDockerImage = 'solr:7.2.0', machineName = 'localhost', network = 'host') {
        this.cmd = cmd;
        this.currentWorkingDirectory = currentWorkingDirectory;
        this.zkhost = zkhost;
        this.confname = confname;
        this.confdir = confdir;
        this.clusterprop = clusterprop;
        this.solrhome = solrhome;
        this.solrDockerImage = solrDockerImage;
        this.machineName = machineName;
        this.network = network;
    }
    BaseCommand() {
        return ` -d ${this.solrDockerImage} ./server/scripts/cloud-scripts/zkcli.sh -zkhost ${this.zkhost} `;
    }
    BaseCommandSolr() {
        return ` -d ${this.solrDockerImage} ./bin/solr zk `;
    }
}
exports.SolrZkcliOptions = SolrZkcliOptions;
//# sourceMappingURL=main.js.map