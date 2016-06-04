/* tslint:disable:no-shadowed-variable */
/* tslint:disable:no-unused-variable */
import test = require('blue-tape');
import * as path from 'path';
import * as util from 'util';
import { Options, exec as solrZkCliCommand } from './index';

test('solr-zkcli', t => {

  t.test('upconfig', t => {
    const options = new Options(
      /* cmd */ 'upconfig',
      /* currentWorkingDirectory */  path.join(__dirname, '..', 'test', 'test1'),
      /* zkhost */ '127.0.0.1:9983',
      /* confname */ 'my_new_config',
      /* confdir */ 'server/solr/configsets/basic_configs/conf',
      /* clusterprop*/ null
      );

    return solrZkCliCommand(options).then(function (data) {
      console.log('data = ', util.inspect(data, { depth: 10 }));
      t.ok(data);
    });
  });
});
