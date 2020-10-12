import { FhirConfig, stubs } from 'fhir-works-on-aws-interface';

const config: FhirConfig = {
    configVersion: 1,
    orgName: 'Organization Name',
    auth: {
        strategy: {
            oauthAuthorizationUrl: 'http://example.com/authorization',
            oauthTokenUrl: 'http://example.com/oauth2/token',
            service: 'OAuth',
        },
        authorization: stubs.passThroughAuthz,
    },
    server: {
        url: 'http://example.com',
    },
    logging: {
        level: 'debug',
    },
    profile: {
        fhirVersion: '3.0.1',
        systemOperations: ['transaction'],
        bundle: stubs.bundle,
        systemSearch: stubs.search,
        systemHistory: stubs.history,
        genericResource: {
            operations: ['read', 'create', 'update', 'vread', 'search-type'],
            excludedR4Resources: ['Organization', 'Account', 'Patient'],
            excludedSTU3Resources: ['ActivityDefinition', 'AllergyIntolerance'],
            fhirVersions: ['4.0.1', '3.0.1'],
            persistence: stubs.persistence,
            typeSearch: stubs.search,
            typeHistory: stubs.history,
        },
    },
};

export default config;
