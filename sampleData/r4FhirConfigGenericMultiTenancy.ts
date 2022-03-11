import {
    Authorization,
    BulkDataAccess,
    Bundle,
    FhirConfig,
    History,
    Persistence,
    Search,
    stubs as fwoaStubs,
} from 'fhir-works-on-aws-interface';

const config = (stubs: {
    bundle: Bundle;
    search: Search;
    history: History;
    passThroughAuthz: Authorization;
    persistence: Persistence;
    bulkDataAccess: BulkDataAccess;
}): FhirConfig => ({
    configVersion: 1,
    validators: [],
    productInfo: {
        orgName: 'Organization Name',
    },
    auth: {
        strategy: {},
        authorization: stubs.passThroughAuthz,
    },
    server: {
        url: 'http://example.com',
    },
    profile: {
        fhirVersion: '4.0.1',
        systemOperations: ['transaction'],
        bundle: stubs.bundle,
        systemSearch: stubs.search,
        systemHistory: stubs.history,
        genericResource: {
            operations: ['create', 'read', 'update', 'patch', 'delete', 'vread', 'search-type', 'history-instance'],
            fhirVersions: ['4.0.1'],
            persistence: stubs.persistence,
            typeSearch: stubs.search,
            typeHistory: stubs.history,
        },
    },
    multiTenancyConfig: {
        enableMultiTenancy: true,
        useTenantSpecificUrl: true,
        tenantIdClaimPath: 'cognito:groups',
        tenantIdClaimValuePrefix: 'tenantprefix:',
        grantAccessAllTenantsScope: 'tenants/all',
    },
});

const configFn = (overrideStubs?: any) => {
    return config({ ...fwoaStubs, ...overrideStubs });
};

export default configFn;
