import { FhirConfig, stubs } from 'fhir-works-on-aws-interface';

const config: FhirConfig = {
    configVersion: 1,
    orgName: 'Organization Name',
    auth: {
        strategy: {},
        authorization: stubs.passThroughAuthz,
    },
    server: {
        url: 'http://example.com',
    },
    logging: {
        level: 'error',
    },
    profile: {
        fhirVersion: '4.0.1',
        systemOperations: [],
        bundle: stubs.bundle,
        systemSearch: stubs.search,
        systemHistory: stubs.history,
        genericResource: {
            operations: ['create', 'read', 'update', 'delete', 'vread', 'history-instance'],
            fhirVersions: ['4.0.1'],
            persistence: stubs.persistence,
            typeSearch: stubs.search,
            typeHistory: stubs.history,
        },
    },
    defaultRetryRequestInSeconds: 15 * 60,
};

export default config;
