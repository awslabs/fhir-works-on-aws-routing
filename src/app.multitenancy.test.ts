import express from 'express';
import { clone, BatchReadWriteResponse } from 'fhir-works-on-aws-interface';
import { generateServerlessRouter } from './app';
import r4FhirConfigGenericMultiTenancy from '../sampleData/r4FhirConfigGenericMultiTenancy';
import ElasticSearchService, { setExpectedSearchSet } from './router/__mocks__/elasticSearchService';
import DynamoDbDataService, { setExpectedCreateResourceId } from './router/__mocks__/dynamoDbDataService';
import DynamoDbBundleService, { setExpectedBundleEntryResponses } from './router/__mocks__/dynamoDbBundleService';
import AuthorizationService, { setExpectedTokenDecoded } from './router/__mocks__/authorizationService';
import validPatient from '../sampleData/validV4Patient.json';

// eslint-disable-next-line import/no-unresolved
const resourceType: string = 'Patient';
const resourceId: string = '12345';
const defaultTenantId: string = 'DEFAULT';
const specificTenantId: string = '915b76f7-8744-4010-bd31-a1e4c0d9fc64';
const wrongTenantId: string = '1234567890';
const anyTenantId: string = '09876543';

const request = require('supertest');

function provideDecodedToken(scopes: string[]) {
    return {
        sub: 'fake',
        name: 'not real',
        iat: 1516239022,
        'cognito:groups': [
            'tenantprefix:915b76f7-8744-4010-bd31-a1e4c0d9fc64',
            'tenantprefix:125545f5-e7e3-4868-898d-092f1023344b',
            'tenantprefix:fe470d0a-c7e9-4857-a39c-9a06f68b517b',
            'practitioner',
        ],
        scope: scopes,
    };
}

const postResource = async (
    app: express.Express,
    resourceTypeToUse: string,
    tenantId: string,
    body: any,
    expectedResourceId: string,
    expectedStatusCode: number,
) => {
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .post(`/tenant/${tenantId}/${resourceTypeToUse}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(body));

    expect(res.statusCode).toEqual(expectedStatusCode);
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.body.id).toEqual(expectedResourceId);
    return res;
};

const postBundle = async (
    app: express.Express,
    tenantId: string,
    body: any,
    bundleEntryResponses: BatchReadWriteResponse[],
    expectedStatusCode: number,
) => {
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .post(`/tenant/${tenantId}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(body));

    expect(res.statusCode).toEqual(expectedStatusCode);
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.body.link[0].url).toEqual(expect.stringContaining(`/tenant/${tenantId}`));
    expect(res.body.entry.length).toEqual(bundleEntryResponses.length);
    expect(res.body.entry[0].response.location).toEqual(
        `${bundleEntryResponses[0].resourceType}/${bundleEntryResponses[0].id}`,
    );
    expect(res.body.entry[0].response.etag).toEqual(bundleEntryResponses[0].vid);
    expect(res.body.entry[0].response.status.toLowerCase()).toEqual(
        expect.stringContaining(bundleEntryResponses[0].operation),
    );
    return res;
};

const getResource = async (
    app: express.Express,
    resourceTypeToUse: string,
    tenantId: string,
    id: string,
    expectedStatusCode: number,
    textMsg?: string,
) => {
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .get(`/tenant/${tenantId}/${resourceTypeToUse}/${id}`)
        .set('Content-Type', 'application/json')
        .send();

    expect(res.statusCode).toEqual(expectedStatusCode);
    if (res.statusCode < 301) {
        expect(res.statusCode).toEqual(expectedStatusCode);
    }
    if (res.statusCode === 400) {
        expect(res.body.issue[0].diagnostics).toContain(textMsg);
    }
    if (res.statusCode === 401) {
        expect(res.text).toContain(textMsg);
    }
    return res;
};

const typeSearch = async (
    app: express.Express,
    resourceTypeToUse: string,
    tenantId: string,
    queryparams: string,
    expectedStatusCode: number,
    textMsg?: string,
) => {
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .get(`/tenant/${tenantId}/${resourceTypeToUse}?${encodeURIComponent(queryparams)}`)
        .set('Content-Type', 'application/json')
        .send();

    expect(res.statusCode).toEqual(expectedStatusCode);
    if (res.statusCode < 301) {
        expect(res.statusCode).toEqual(expectedStatusCode);
        expect(res.body.link[0].url).toEqual(expect.stringContaining(`/tenant/${tenantId}`));
        expect(res.body.entry.length).toEqual(1);
        expect(res.body.entry[0].fullUrl).toEqual(expect.stringContaining(`/tenant/${tenantId}`));
    }
    if (res.statusCode === 400) {
        expect(res.body.issue[0].diagnostics).toContain(textMsg);
    }
    if (res.statusCode === 401) {
        expect(res.text).toContain(textMsg);
    }
    return res;
};

const putResource = async (
    app: express.Express,
    resourceTypeToUse: string,
    tenantId: string,
    id: string,
    body: any,
    expectedStatusCode: number,
) => {
    const overrideResource = clone(body);
    overrideResource.id = id;
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .put(`/tenant/${tenantId}/${resourceTypeToUse}/${id}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(overrideResource));

    expect(res.statusCode).toEqual(expectedStatusCode);
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.body.id).toEqual(id);
    return res;
};

const patchResource = async (
    app: express.Express,
    resourceTypeToUse: string,
    tenantId: string,
    id: string,
    body: any,
    expectedStatusCode: number,
) => {
    const patchedResource = clone(body);
    patchedResource.id = id;
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .patch(`/tenant/${tenantId}/${resourceTypeToUse}/${id}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(patchedResource));

    expect(res.statusCode).toEqual(expectedStatusCode);
    expect(res.headers['content-type']).toEqual('application/json; charset=utf-8');
    expect(res.body.id).toEqual(id);
    return res;
};
const deleteResource = async (
    app: express.Express,
    resourceTypeToUse: string,
    tenantId: string,
    id: string,
    expectedStatusCode: number,
) => {
    const requestWithSupertest = request(app);
    const res = await requestWithSupertest
        .delete(`/tenant/${tenantId}/${resourceTypeToUse}/${id}`)
        .set('Content-Type', 'application/json')
        .send();

    expect(res.statusCode).toEqual(expectedStatusCode);
};

describe('Multi tenancy: generateServerlessRouter CRUD operations', () => {
    const fhirConfig = r4FhirConfigGenericMultiTenancy({
        passThroughAuthz: AuthorizationService,
        search: ElasticSearchService,
        persistence: DynamoDbDataService,
    });
    const app = generateServerlessRouter(fhirConfig, ['Patient']);

    test(`Get: /${specificTenantId}/${resourceType}/${resourceId} should return 200.`, async () => {
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await getResource(app, resourceType, specificTenantId, resourceId, 200);
    });

    test(`Get: /${defaultTenantId}/${resourceType}/${resourceId} should return 200.`, async () => {
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await getResource(app, resourceType, defaultTenantId, resourceId, 200);
    });

    test(`Post: /${specificTenantId}/${resourceType} should return 201.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await postResource(app, resourceType, specificTenantId, validPatient, resourceId, 201);
    });

    test(`Post: /${defaultTenantId}/${resourceType} should return 201.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await postResource(app, resourceType, defaultTenantId, validPatient, resourceId, 201);
    });

    test(`Put: /${specificTenantId}/${resourceType} should return 200.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await putResource(app, resourceType, specificTenantId, resourceId, validPatient, 200);
    });

    test(`Put: /${defaultTenantId}/${resourceType} should return 200.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await putResource(app, resourceType, defaultTenantId, resourceId, validPatient, 200);
    });

    test(`Patch: /${specificTenantId}/${resourceType} should return 200.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await patchResource(app, resourceType, specificTenantId, resourceId, validPatient, 200);
    });

    test(`Patch: /${defaultTenantId}/${resourceType} should return 200.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await patchResource(app, resourceType, defaultTenantId, resourceId, validPatient, 200);
    });

    test(`Delete: /${specificTenantId}/${resourceType} should return 200.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await deleteResource(app, resourceType, specificTenantId, resourceId, 200);
    });

    test(`Delete: /${defaultTenantId}/${resourceType} should return 200.`, async () => {
        setExpectedCreateResourceId(resourceId);
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await deleteResource(app, resourceType, defaultTenantId, resourceId, 200);
    });
});

describe('Multi tenancy: generateServerlessRouter metadata access', () => {
    const fhirConfig = r4FhirConfigGenericMultiTenancy({
        passThroughAuthz: AuthorizationService,
        search: ElasticSearchService,
        persistence: DynamoDbDataService,
    });
    const app = generateServerlessRouter(fhirConfig, ['Patient']);

    test(`Get: /${specificTenantId}/metadata should return 200.`, async () => {
        const requestWithSupertest = request(app);
        const res = await requestWithSupertest
            .get(`/tenant/${specificTenantId}/metadata`)
            .set('Content-Type', 'application/json')
            .send();

        expect(res.statusCode).toEqual(200);
    });

    test(`Get: /${defaultTenantId}/metadata should return 200.`, async () => {
        const requestWithSupertest = request(app);
        const res = await requestWithSupertest
            .get(`/tenant/${defaultTenantId}/metadata`)
            .set('Content-Type', 'application/json')
            .send();

        expect(res.statusCode).toEqual(200);
    });
});

describe('Multi tenancy: generateServerlessRouter typesearch', () => {
    const fhirConfig = r4FhirConfigGenericMultiTenancy({
        passThroughAuthz: AuthorizationService,
        search: ElasticSearchService,
        persistence: DynamoDbDataService,
    });
    const app = generateServerlessRouter(fhirConfig, ['Patient']);
    const queryParam =
        'identifier=https://github.com/synthetichealth/synthea|e531c09f-6887-6aba-af17-cbc521900b87&birthdate=1992-08-02&family=Simpson&given=Lisa';

    test(`Get: search /${specificTenantId}/${resourceType}?${queryParam} should return 200.`, async () => {
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));
        setExpectedSearchSet([
            {
                fullUrl: 'Patient/cc8b9b47-f2a2-4779-b45a-6b18e6310aab',
                resource: {
                    resourceType: 'Patient',
                    id: 'cc8b9b47-f2a2-4779-b45a-6b18e6310aab',
                    meta: {
                        versionId: 'dfcc8fb7-ceae-44d2-8a3b-70903f3b89bc',
                        lastUpdated: '2021-08-18T12:49:12.757+00:00',
                        source: '#qLEZvGrdkonQ2ihA',
                    },
                    text: {
                        status: 'generated',
                        div: '',
                    },
                    identifier: [
                        {
                            system: 'https://github.com/synthetichealth/synthea',
                            value: 'e531c09f-6887-6aba-af17-cbc521900b87',
                        },
                    ],
                    name: [
                        {
                            use: 'official',
                            family: 'Simpson',
                            given: ['Lisa'],
                            prefix: ['Ms.'],
                        },
                    ],
                    gender: 'female',
                    birthDate: '1992-08-02',
                },
                search: {
                    mode: 'match',
                },
            },
        ]);

        await typeSearch(app, resourceType, specificTenantId, queryParam, 200);
    });
});

describe('Multi tenancy: generateServerlessRouter bundle transaction', () => {
    const fhirConfig = r4FhirConfigGenericMultiTenancy({
        passThroughAuthz: AuthorizationService,
        search: ElasticSearchService,
        persistence: DynamoDbDataService,
        bundle: DynamoDbBundleService,
    });

    const bundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
            {
                resource: validPatient,
                request: {
                    method: 'POST',
                    url: 'Patient',
                },
            },
        ],
    };
    const bundleEntryResponses: BatchReadWriteResponse[] = [
        {
            id: '8cafa46d-08b4-4ee4-b51b-803e20ae8126',
            vid: '1',
            operation: 'create',
            lastModified: '2020-04-23T21:19:35.592Z',
            resourceType: 'Patient',
            resource: {},
        },
    ];

    const app = generateServerlessRouter(fhirConfig, ['Patient', 'Bundle']);

    test(`Post: bundle /${specificTenantId} should return 200.`, async () => {
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));
        setExpectedBundleEntryResponses(bundleEntryResponses);

        await postBundle(app, specificTenantId, bundle, bundleEntryResponses, 200);
    });
});

describe('Multi tenancy: generateServerlessRouter authorization checks', () => {
    const fhirConfig = r4FhirConfigGenericMultiTenancy({
        passThroughAuthz: AuthorizationService,
        search: ElasticSearchService,
        persistence: DynamoDbDataService,
    });
    const app = generateServerlessRouter(fhirConfig, ['Patient']);

    test(`Get: wrong tenant /${wrongTenantId}/${resourceType}/${resourceId} should return 401.`, async () => {
        setExpectedTokenDecoded(provideDecodedToken(['profile', 'openid']));

        await getResource(app, resourceType, wrongTenantId, resourceId, 401, 'Unauthorized');
    });

    test(`Get: tenants/all /${anyTenantId}/${resourceType}/${resourceId} should return 200.`, async () => {
        setExpectedTokenDecoded(provideDecodedToken(['tenants/all', 'profile', 'openid']));
        await getResource(app, resourceType, wrongTenantId, resourceId, 200);
    });
});
