"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-unused-variable */
const main_1 = require("./main");
const path = __importStar(require("path"));
const util = __importStar(require("util"));
describe('SolrZkCliCommand', () => {
    it('upconfig', (done) => {
        const solrZkcliOptions = new main_1.SolrZkcliOptions(
        /* cmd */ 'upconfig', 
        /* currentWorkingDirectory */ undefined, 
        /* zkhost */ '127.0.0.1:2181/mychroot', 
        /* confname */ 'my_new_config', 
        /* confdir */ path.resolve(__dirname, '..', 'test', 'solr', 'fmlogs', 'conf'), 
        /* clusterprop*/ undefined);
        return Promise.resolve().then(() => {
            return main_1.SolrZkCliCommand(solrZkcliOptions);
        }).then((data) => {
            console.log('data = ', util.inspect(data, { depth: 10 }));
            expect(data.ok).toBeTruthy();
            done();
        });
    }, 100000); //100 seconds timeout
});
// describe('SolrZkCliCommand', () => {
//   it('mkroot', (done) => {
//     const solrZkcliOptions = new SolrZkcliOptions(
//       /* cmd */ 'mkroot',
//       /* currentWorkingDirectory */  undefined,
//       /* zkhost */ '127.0.0.1:2181',
//       /* confname */ 'my_new_config',
//       /* confdir */ undefined,
//       /* clusterprop*/ undefined,
//       /* solrhome */ undefined,
//       /* solrdockerimage */ 'quobjectio/solr:7.2.1'
//     );
//     return Promise.resolve().then(() => {
//       return SolrZkCliCommand(solrZkcliOptions);
//     }).then((data: SolrZkcliResult) => {
//       console.log('data = ', util.inspect(data, { depth: 10 }));
//       expect(data.ok).toBeTruthy();
//       done();
//     });
//   });
// });
// describe('Markdown2Epub getName function return value', () => {
//   it('Should be defined.', () => {
//     return Promise.resolve().then(() => {
//       return Markdown2Epub.copyAndMergeFiles();
//     }).then((data: any) => {
//       expect(true).toBe(true);
//     });
//   });
//   // it("Should return 'MyName'", () => {
//   //   const myapi = new MyApi();
//   //   expect(myapi.getName()).toBe('tsnodebase');
//   // });
// });
//# sourceMappingURL=main.spec.js.map