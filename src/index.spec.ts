/* tslint:disable:no-unused-variable */
import { SolrZkcliOptions, SolrZkCliCommand, SolrZkcliResult } from './index';
import * as path from 'path';
import * as util from 'util';
import { } from 'jasmine';

//./node_modules/.bin/concurrently --kill-others "tsc -w" "nodemon ./lib/index.js" "npm run test" "npm run reload"

//describe('SolrZkCliCommand', () => {
//  it('upconfig', (done) => {
//    const solrZkcliOptions = new SolrZkcliOptions(
//        /* cmd */ 'upconfig',
//        /* currentWorkingDirectory */  undefined,
//        /* zkhost */ '127.0.0.1:2181/mychroot',
//        /* confname */ 'my_new_config',
//        /* confdir */ path.resolve(__dirname, '..', 'test', 'solr', 'fmlogs', 'conf'),
//        /* clusterprop*/ undefined,

//    );

//    return Promise.resolve().then(() => {
//      return SolrZkCliCommand(solrZkcliOptions);
//    }).then((data: SolrZkcliResult) => {
//      console.log('data = ', util.inspect(data, { depth: 10 }));
//      expect(data.ok).toBeTruthy();
//      done();
//    });
//  });
//});

describe('SolrZkCliCommand', () => {
  it('mkroot', (done) => {
    const solrZkcliOptions = new SolrZkcliOptions(
      /* cmd */ 'mkroot',
      /* currentWorkingDirectory */  undefined,
      /* zkhost */ '127.0.0.1:2181',
      /* confname */ 'my_new_config',
      /* confdir */ undefined,
      /* clusterprop*/ undefined,
      /* solrhome */ undefined,
      /* solrdockerimage */ 'quobjectio/solr:7.2.1'

    );

    return Promise.resolve().then(() => {
      return SolrZkCliCommand(solrZkcliOptions);
    }).then((data: SolrZkcliResult) => {
      console.log('data = ', util.inspect(data, { depth: 10 }));
      expect(data.ok).toBeTruthy();
      done();
    });
  });
});
