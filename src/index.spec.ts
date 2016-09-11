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
      /* currentWorkingDirectory */  null,
      /* zkhost */ '127.0.0.1:2181',
      /* confname */ 'my_new_config',
      /* confdir */ path.resolve(__dirname, '..', 'test', 'solr', 'fmlogs', 'conf'),
      /* clusterprop*/ null
      );

    return solrZkCliCommand(options).then(function (data) {
      console.log('data = ', util.inspect(data, { depth: 10 }));
      t.ok(data);
    });
  });
});
