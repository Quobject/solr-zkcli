/* tslint:disable:no-unused-variable */
import { SolrZkcliOptions, SolrZkCliCommand, SolrZkcliResult } from './main';
import * as path from 'path';
import * as util from 'util';


describe('SolrZkCliCommand', () => {
  it('upconfig', (done) => {
    const solrZkcliOptions = new SolrZkcliOptions(
        /* cmd */ 'upconfig',
        /* currentWorkingDirectory */  undefined,
        /* zkhost */ 'zookeeper-ap-southeast-2-1:2181/my_new_config',
        /* confname */ 'my_new_config',
        /* confdir */ '/fleetmake/ebs/solr-fmlogs-ap-southeast-2-1-1/for_upconfig/fmlogs/conf',
        /* clusterprop*/ undefined,
        /* solrhome */ undefined,
        /* solrdockerimage */ 'quobjectio/solr:7.2.1',
        /* machineName */ 'localhost',
        /* network */ 'fm-net',
    );

    return Promise.resolve().then(() => {
      return SolrZkCliCommand(solrZkcliOptions);
    }).then((data: SolrZkcliResult) => {
      console.log('data = ', util.inspect(data, { depth: 10 }));
      expect(data.ok).toBeTruthy();
      done();
    });
  }, 1000000); //1000 seconds timeout
 });

//  describe('SolrZkCliCommand', () => {
//    it('mkroot', (done) => {
//      const solrZkcliOptions = new SolrZkcliOptions(
//        /* cmd */ 'mkroot',
//        /* currentWorkingDirectory */  undefined,
//        /* zkhost */ 'zookeeper-ap-southeast-2-1:2181',
//        /* confname */ 'my_new_config',
//        /* confdir */ undefined,
//        /* clusterprop*/ undefined,
//        /* solrhome */ undefined,
//        /* solrdockerimage */ 'quobjectio/solr:7.2.1',
//        /* machineName */ 'localhost',
//        /* network */ 'fm-net',

//      );

//      return Promise.resolve().then(() => {
//        return SolrZkCliCommand(solrZkcliOptions);
//      }).then((data: SolrZkcliResult) => {
//        console.log('data = ', util.inspect(data, { depth: 10 }));
//        expect(data.ok).toBeTruthy();
//        done();
//      });
//    });
//  });




