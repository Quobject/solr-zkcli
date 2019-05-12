export declare class SolrZkcliResult {
    error: string;
    ok: boolean;
    returnedData: string;
    constructor(error?: string, ok?: boolean, returnedData?: string);
}
export declare function SolrZkCliCommand(options: SolrZkcliOptions, callback?: (err: string, data: string) => void): Promise<any>;
export declare class SolrZkcliOptions {
    cmd: string;
    currentWorkingDirectory?: string;
    zkhost?: string;
    confname?: string;
    confdir?: string;
    clusterprop?: {
        name: string;
        val: string;
    };
    solrhome?: string;
    solrDockerImage: string;
    constructor(cmd: string, currentWorkingDirectory?: string, zkhost?: string, confname?: string, confdir?: string, clusterprop?: {
        name: string;
        val: string;
    }, solrhome?: string, solrDockerImage?: string);
    BaseCommand(): string;
    BaseCommandSolr(): string;
}
