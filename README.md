# solr-zkcli
A node.js implementation of Solr's ZooKeeper CLI zkcli.sh to manage [SolrCloud configuration parameters](https://cwiki.apache.org/confluence/display/solr/Command+Line+Utilities)/

[![NPM](https://nodei.co/npm/solr-zkcli.png?downloads=true&downloadRank=true)](https://nodei.co/npm/solr-zkcli/)
[![NPM](https://nodei.co/npm-dl/solr-zkcli.png?months=6&height=3)](https://nodei.co/npm/solr-zkcli/)

## Installation

   
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
}

solrZkcli( options ).then(function (data) {
  console.log('data = ', data); 
});

//

```

With callback:

```js

solrZkcli( options, function (err, data) {
  console.log('data = ', data);
});

```

