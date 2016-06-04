# solr-zkcli
A node.js wrapper for the Solr's ZooKeeper CLI zkcli.sh to manage [SolrCloud configuration parameters](https://cwiki.apache.org/confluence/display/solr/Command+Line+Utilities)

[![NPM](https://nodei.co/npm/solr-zkcli.png?downloads=true&downloadRank=true)](https://nodei.co/npm/solr-zkcli/)
[![NPM](https://nodei.co/npm-dl/solr-zkcli.png?months=6&height=3)](https://nodei.co/npm/solr-zkcli/)

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

## Installation

### Step 1: Prerequisites

The [docker](https://docs.docker.com/engine/installation/) command line tool must be installed and accessible in the path. 

### Step 2: Get solr image

    docker pull quobjectio/solr:1.0.0

### Step 3: Installation
  
    npm install solr-zkcli
    
Then:

```js
var solrZkcli = require('solr-zkcli');
```

## Usage

With promise

```js

var options = {
  zkhost: '127.0.0.1:9983',
  cmd: 'upconfig',
  confname: 'my_new_config',
  confdir: 'server/solr/configsets/basic_configs/conf'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

With callback:

```js

solrZkcli( options, function (err, data) {
  console.log('data = ', data);
});

```

* bootstrap

```js

var options = {
  zkhost: '127.0.0.1:9983/fmlogging',
  cmd: 'bootstrap',
  solrhome: 'server/solr/'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

* put

```js

var options = {
  zkhost: '127.0.0.1:9983',
  cmd: 'put /my_zk_file.txt \'some data\''
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

* putfile

```js

var options = {
  zkhost: '127.0.0.1:9983',
  cmd: 'putfile /my_zk_file.txt /tmp/my_local_file.txt'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

* makepath

```js

var options = {
  zkhost: '127.0.0.1:9983',
  cmd: 'makepath /solr'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

* clusterprop

```js

var options = {
  zkhost: '127.0.0.1:' + config.zkport,
  cmd: 'clusterprop',
  name: 'urlScheme',
  val: 'https'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

* downconfig

```js

var options = {
  zkhost: '127.0.0.1:9983',
  cmd: 'downconfig',
  confname: 'my_new_config',
  confdir: '/var/download'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }

```

* get

```js

var options = {
  zkhost: '127.0.0.1:' + config.zkport,
  cmd: 'get /my_zk_file.txt'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  data =  { ok: true, returnedData: 'some data' }

```

* getfile

```js

var options = {
  zkhost: '127.0.0.1:' + config.zkport,
  cmd: 'get /my_zk_file.txt /path/to/return.txt'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  data =  { ok: true }

```



* list

```js

var options = {
  zkhost: '127.0.0.1:' + config.zkport,
  cmd: 'list'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data = {
//  ok: true,
//  returnedData:
//   ['/ (2)',
//     'DATA:',
//     '    ',
//     ' /my_zk_file.txt (0)',
//     ' DATA: ...supressed...',
//     ' /zookeeper (1)',
//     ' DATA:']
//}

```

* clear

```js

var options = {
  zkhost: '127.0.0.1:' + config.zkport,
  cmd: 'clear /solr'
};

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//data =  { ok: true }
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/solr-zkcli.svg?style=flat
[npm-url]: https://npmjs.org/package/solr-zkcli
[downloads-image]: https://img.shields.io/npm/dm/solr-zkcli.svg?style=flat
[downloads-url]: https://npmjs.org/package/solr-zkcli
