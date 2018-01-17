/* tslint:disable:no-unused-variable */
import { SolrSkcliOptions, SolrZkCliCommand, SolrSkcliResult } from './index';
import * as path from 'path';
import * as util from 'util';
import { } from 'jasmine';

//./node_modules/.bin/concurrently --kill-others "tsc -w" "nodemon ./lib/index.js" "npm run test" "npm run reload" 

describe('index', () => {
  //let originalTimeout: number;

  //beforeEach(function () {
  //  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  //  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
  //});

  //afterEach(function () {
  //  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  //});

  it('getLastPartOfId should work', (done) => {

    const solrSkcliOptions = new SolrSkcliOptions(
      /* cmd */ 'upconfig',
      /* currentWorkingDirectory */  undefined,
      /* zkhost */ '127.0.0.1:2181',
      /* confname */ 'my_new_config',
      /* confdir */ path.resolve(__dirname, '..', 'test', 'solr', 'fmlogs', 'conf'),
      /* clusterprop*/ undefined
    );

    return Promise.resolve().then(() => {
      return SolrZkCliCommand(solrSkcliOptions);
    }).then((data: SolrSkcliResult) => {
      console.log('data = ', util.inspect(data, { depth: 10 }));
      expect(data.ok).toBeTruthy();
      done();
    });
    
  });
});


