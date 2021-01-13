/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import uuidv4 from 'uuid/v4';
import {
    clone,
    GenericResource,
    stubs,
    FhirVersion,
    Resources,
    InvalidResourceError,
    Authorization,
    UnauthorizedError,
    AccessBulkDataJobRequest,
} from 'fhir-works-on-aws-interface';
import DynamoDbDataService from '../__mocks__/dynamoDbDataService';
import DynamoDbBundleService from '../__mocks__/dynamoDbBundleService';
import BundleHandler from './bundleHandler';
import { MAX_BUNDLE_ENTRIES } from '../../constants';
import { uuidRegExp, utcTimeRegExp } from '../../regExpressions';
import r4FhirConfigGeneric from '../../../sampleData/r4FhirConfigGeneric';
import ConfigHandler from '../../configHandler';

const sampleBundleRequestJSON = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [],
};

const practitionerDecoded = {
    sub: 'fake',
    'cognito:groups': ['practitioner'],
    name: 'not real',
    iat: 1516239022,
};

const genericResource: GenericResource = {
    operations: ['create', 'read', 'update', 'delete'],
    fhirVersions: ['3.0.1', '4.0.1'],
    persistence: DynamoDbDataService,
    typeHistory: stubs.history,
    typeSearch: stubs.search,
};
const resources = {};

const SUPPORTED_R4_RESOURCES = [
    'Account',
    'ActivityDefinition',
    'AdverseEvent',
    'AllergyIntolerance',
    'Appointment',
    'AppointmentResponse',
    'AuditEvent',
    'Basic',
    'Binary',
    'BiologicallyDerivedProduct',
    'BodyStructure',
    'Bundle',
    'CapabilityStatement',
    'CarePlan',
    'CareTeam',
    'CatalogEntry',
    'ChargeItem',
    'ChargeItemDefinition',
    'Claim',
    'ClaimResponse',
    'ClinicalImpression',
    'CodeSystem',
    'Communication',
    'CommunicationRequest',
    'CompartmentDefinition',
    'Composition',
    'ConceptMap',
    'Condition',
    'Consent',
    'Contract',
    'Coverage',
    'CoverageEligibilityRequest',
    'CoverageEligibilityResponse',
    'DetectedIssue',
    'Device',
    'DeviceDefinition',
    'DeviceMetric',
    'DeviceRequest',
    'DeviceUseStatement',
    'DiagnosticReport',
    'DocumentManifest',
    'DocumentReference',
    'EffectEvidenceSynthesis',
    'Encounter',
    'Endpoint',
    'EnrollmentRequest',
    'EnrollmentResponse',
    'EpisodeOfCare',
    'EventDefinition',
    'Evidence',
    'EvidenceVariable',
    'ExampleScenario',
    'ExplanationOfBenefit',
    'FamilyMemberHistory',
    'Flag',
    'Goal',
    'GraphDefinition',
    'Group',
    'GuidanceResponse',
    'HealthcareService',
    'ImagingStudy',
    'Immunization',
    'ImmunizationEvaluation',
    'ImmunizationRecommendation',
    'ImplementationGuide',
    'InsurancePlan',
    'Invoice',
    'Library',
    'Linkage',
    'List',
    'Location',
    'Measure',
    'MeasureReport',
    'Media',
    'Medication',
    'MedicationAdministration',
    'MedicationDispense',
    'MedicationKnowledge',
    'MedicationRequest',
    'MedicationStatement',
    'MedicinalProduct',
    'MedicinalProductAuthorization',
    'MedicinalProductContraindication',
    'MedicinalProductIndication',
    'MedicinalProductIngredient',
    'MedicinalProductOperation',
    'MedicinalProductManufactured',
    'MedicinalProductPackaged',
    'MedicinalProductPharmaceutical',
    'MedicinalProductUndesirableEffect',
    'MessageDefinition',
    'MessageHeader',
    'MolecularSequence',
    'NamingSystem',
    'NutritionOrder',
    'Observation',
    'ObservationDefinition',
    'OperationDefinition',
    'OperationOutcome',
    'Organization',
    'OrganizationAffiliation',
    'Parameters',
    'Patient',
    'PaymentNotice',
    'PaymentReconciliation',
    'Person',
    'PlanDefinition',
    'Practitioner',
    'PractitionerRole',
    'Procedure',
    'Provenance',
    'Questionnaire',
    'QuestionnaireResponse',
    'RelatedPerson',
    'RequestGroup',
    'ResearchDefinition',
    'ResearchElementDefinition',
    'ResearchStudy',
    'ResearchSubject',
    'RiskAssessment',
    'RiskEvidenceSynthesis',
    'Schedule',
    'SearchParameter',
    'ServiceRequest',
    'Slot',
    'Specimen',
    'SpecimenDefinition',
    'StructureDefinition',
    'StructureMap',
    'Subscription',
    'Substance',
    'SubstancePolymer',
    'SubstanceProtein',
    'SubstanceReferenceInformation',
    'SubstanceSpecification',
    'SubstanceSourceMaterial',
    'SupplyDelivery',
    'SupplyRequest',
    'Task',
    'TerminologyCapabilities',
    'TestReport',
    'TestScript',
    'ValueSet',
    'VerificationResult',
    'VisionPrescription',
];

const SUPPORTED_STU3_RESOURCES = [
    'Account',
    'ActivityDefinition',
    'AdverseEvent',
    'AllergyIntolerance',
    'Appointment',
    'AppointmentResponse',
    'AuditEvent',
    'Basic',
    'Binary',
    'BodySite',
    'Bundle',
    'CapabilityStatement',
    'CarePlan',
    'CareTeam',
    'ChargeItem',
    'Claim',
    'ClaimResponse',
    'ClinicalImpression',
    'CodeSystem',
    'Communication',
    'CommunicationRequest',
    'CompartmentDefinition',
    'Composition',
    'ConceptMap',
    'Condition',
    'Consent',
    'Contract',
    'Coverage',
    'DataElement',
    'DetectedIssue',
    'Device',
    'DeviceComponent',
    'DeviceMetric',
    'DeviceRequest',
    'DeviceUseStatement',
    'DiagnosticReport',
    'DocumentManifest',
    'DocumentReference',
    'EligibilityRequest',
    'EligibilityResponse',
    'Encounter',
    'Endpoint',
    'EnrollmentRequest',
    'EnrollmentResponse',
    'EpisodeOfCare',
    'ExpansionProfile',
    'ExplanationOfBenefit',
    'FamilyMemberHistory',
    'Flag',
    'Goal',
    'GraphDefinition',
    'Group',
    'GuidanceResponse',
    'HealthcareService',
    'ImagingManifest',
    'ImagingStudy',
    'Immunization',
    'ImmunizationRecommendation',
    'ImplementationGuide',
    'Library',
    'Linkage',
    'List',
    'Location',
    'Measure',
    'MeasureReport',
    'Media',
    'Medication',
    'MedicationAdministration',
    'MedicationDispense',
    'MedicationRequest',
    'MedicationStatement',
    'MessageDefinition',
    'MessageHeader',
    'NamingSystem',
    'NutritionOrder',
    'Observation',
    'OperationDefinition',
    'OperationOutcome',
    'Organization',
    'Parameters',
    'Patient',
    'PaymentNotice',
    'PaymentReconciliation',
    'Person',
    'PlanDefinition',
    'Practitioner',
    'PractitionerRole',
    'Procedure',
    'ProcedureRequest',
    'ProcessRequest',
    'ProcessResponse',
    'Provenance',
    'Questionnaire',
    'QuestionnaireResponse',
    'ReferralRequest',
    'RelatedPerson',
    'RequestGroup',
    'ResearchStudy',
    'ResearchSubject',
    'RiskAssessment',
    'Schedule',
    'SearchParameter',
    'Sequence',
    'ServiceDefinition',
    'Slot',
    'Specimen',
    'StructureDefinition',
    'StructureMap',
    'Subscription',
    'Substance',
    'SupplyDelivery',
    'SupplyRequest',
    'Task',
    'TestScript',
    'TestReport',
    'ValueSet',
    'VisionPrescription',
];

const getSupportedGenericResources = (
    genRes: GenericResource,
    supportedResources: string[],
    fhirVersion: FhirVersion,
): string[] => {
    const customFhirConfig = r4FhirConfigGeneric();
    customFhirConfig.profile.genericResource = genRes;
    const configHandler = new ConfigHandler(customFhirConfig, supportedResources);
    return configHandler.getGenericResources(fhirVersion);
};

const bundleHandlerR4 = new BundleHandler(
    DynamoDbBundleService,
    'https://API_URL.com',
    '4.0.1',
    stubs.passThroughAuthz,
    getSupportedGenericResources(genericResource, SUPPORTED_R4_RESOURCES, '4.0.1'),
    genericResource,
    resources,
);

const bundleHandlerSTU3 = new BundleHandler(
    DynamoDbBundleService,
    'https://API_URL.com',
    '3.0.1',
    stubs.passThroughAuthz,
    getSupportedGenericResources(genericResource, SUPPORTED_STU3_RESOURCES, '3.0.1'),
    genericResource,
    resources,
);

const sampleCrudEntries = [
    {
        fullUrl: 'urn:uuid:8cafa46d-08b4-4ee4-b51b-803e20ae8126',
        resource: {
            resourceType: 'Patient',
            id: '8cafa46d-08b4-4ee4-b51b-803e20ae8126',
            name: [
                {
                    family: 'Jameson',
                    given: ['Matt'],
                },
            ],
            gender: 'male',
        },
        request: {
            method: 'PUT',
            url: 'Patient/8cafa46d-08b4-4ee4-b51b-803e20ae8126',
        },
    },
    {
        resource: {
            resourceType: 'Patient',
            name: [
                {
                    family: 'Smith',
                    given: ['John'],
                },
            ],
            gender: 'male',
        },
        request: {
            method: 'POST',
            url: 'Patient',
        },
    },
    {
        request: {
            method: 'GET',
            url: 'Patient/47135b80-b721-430b-9d4b-1557edc64947',
        },
    },
    {
        request: {
            method: 'DELETE',
            url: 'Patient/bce8411e-c15e-448c-95dd-69155a837405',
        },
    },
];

describe('ERROR Cases: Validation of Bundle request', () => {
    beforeEach(() => {
        // Ensures that for each test, we test the assertions in the catch block
        expect.hasAssertions();
    });
    test('Batch processing', async () => {
        try {
            // Cloning
            const bundleRequestJSON = clone(sampleBundleRequestJSON);

            await bundleHandlerR4.processBatch(bundleRequestJSON, practitionerDecoded);
        } catch (e) {
            expect(e.name).toEqual('BadRequestError');
            expect(e.statusCode).toEqual(400);
            expect(e.message).toEqual('Currently this server only support transaction Bundles');
        }
    });

    test('Bundle V4 JSON format not correct', async () => {
        try {
            const invalidReadRequest = {
                request: {
                    method: 'GET',
                    url: 'Patient/575fdea9-202d-4a14-9a23-0599dcd01a09',
                    invalidField: 'foo',
                },
            };

            // Cloning
            const bundleRequestJSON = clone(sampleBundleRequestJSON);
            bundleRequestJSON.entry.push(invalidReadRequest);

            await bundleHandlerR4.processTransaction(bundleRequestJSON, practitionerDecoded);
        } catch (e) {
            expect(e).toEqual(new InvalidResourceError('data.entry[0].request should NOT have additional properties'));
        }
    });

    // V3 schema is very relaxed. It only requires that 'resourceType' is definded in the bundle
    test('Bundle V3 JSON format not correct', async () => {
        try {
            const invalidReadRequest = {
                request: {
                    method: 'GET',
                    url: 'Patient/575fdea9-202d-4a14-9a23-0599dcd01a09',
                    invalidField: 'foo',
                },
            };

            // Cloning
            const bundleRequestJSON = clone(sampleBundleRequestJSON);
            bundleRequestJSON.entry.push(invalidReadRequest);

            delete bundleRequestJSON.resourceType;

            await bundleHandlerSTU3.processTransaction(bundleRequestJSON, practitionerDecoded);
        } catch (e) {
            expect(e).toEqual(new InvalidResourceError("data should have required property 'resourceType'"));
        }
    });

    test('Bundle request has unsupported operation: SEARCH', async () => {
        try {
            const searchRequest = {
                request: {
                    method: 'GET',
                    url: 'Patient?gender=female',
                },
            };

            // Cloning
            const bundleRequestJSON = clone(sampleBundleRequestJSON);
            bundleRequestJSON.entry.push(searchRequest);

            await bundleHandlerR4.processTransaction(bundleRequestJSON, practitionerDecoded);
        } catch (e) {
            expect(e.name).toEqual('BadRequestError');
            expect(e.statusCode).toEqual(400);
            expect(e.message).toEqual('We currently do not support SEARCH entries in the Bundle');
        }
    });

    test('Bundle request has unsupported operation: VREAD', async () => {
        try {
            const vreadRequest = {
                request: {
                    method: 'GET',
                    url: 'Patient/575fdea9-202d-4a14-9a23-0599dcd01a09/_history/1',
                },
            };

            // Cloning
            const bundleRequestJSON = clone(sampleBundleRequestJSON);
            bundleRequestJSON.entry.push(vreadRequest);

            await bundleHandlerR4.processTransaction(bundleRequestJSON, practitionerDecoded);
        } catch (e) {
            expect(e.name).toEqual('BadRequestError');
            expect(e.statusCode).toEqual(400);
            expect(e.message).toEqual('We currently do not support V_READ entries in the Bundle');
        }
    });

    test('Bundle request has too many entries', async () => {
        // Cloning
        const bundleRequestJSON = clone(sampleBundleRequestJSON);
        for (let i = 0; i < MAX_BUNDLE_ENTRIES + 1; i += 1) {
            const readRequest = {
                request: {
                    method: 'GET',
                    url: `Patient/${uuidv4()}`,
                },
            };
            bundleRequestJSON.entry.push(readRequest);
        }
        try {
            await bundleHandlerR4.processTransaction(bundleRequestJSON, practitionerDecoded);
        } catch (e) {
            expect(e.name).toEqual('BadRequestError');
            expect(e.statusCode).toEqual(400);
            expect(e.message).toEqual(
                `Maximum number of entries for a Bundle is ${MAX_BUNDLE_ENTRIES}. There are currently ${bundleRequestJSON.entry.length} entries in this Bundle`,
            );
        }
    });
});

describe('SUCCESS Cases: Testing Bundle with CRUD entries', () => {
    test('Handle CRUD requests in a Bundle', async () => {
        // Cloning
        const bundleRequestJSON = clone(sampleBundleRequestJSON);
        bundleRequestJSON.entry = bundleRequestJSON.entry.concat(sampleCrudEntries);

        const actualResult = await bundleHandlerR4.processTransaction(bundleRequestJSON, practitionerDecoded);

        const expectedResult = {
            resourceType: 'Bundle',
            id: expect.stringMatching(uuidRegExp),
            type: 'transaction-response',
            link: [
                {
                    relation: 'self',
                    url: 'https://API_URL.com',
                },
            ],
            entry: [
                {
                    response: {
                        status: '200 OK',
                        location: 'Patient/8cafa46d-08b4-4ee4-b51b-803e20ae8126',
                        etag: '3',
                        lastModified: '2020-04-23T21:19:35.592Z',
                    },
                },
                {
                    response: {
                        status: '201 Created',
                        location: 'Patient/7c7cf4ca-4ba7-4326-b0dd-f3275b735827',
                        etag: '1',
                        lastModified: expect.stringMatching(utcTimeRegExp),
                    },
                },
                {
                    resource: {
                        active: true,
                        resourceType: 'Patient',
                        birthDate: '1995-09-24',
                        meta: {
                            lastUpdated: expect.stringMatching(utcTimeRegExp),
                            versionId: '1',
                        },
                        managingOrganization: {
                            reference: 'Organization/2.16.840.1.113883.19.5',
                            display: 'Good Health Clinic',
                        },
                        text: {
                            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p></p></div>',
                            status: 'generated',
                        },
                        id: '47135b80-b721-430b-9d4b-1557edc64947',
                        name: [
                            {
                                family: 'Langard',
                                given: ['Abby'],
                            },
                        ],
                        gender: 'female',
                    },
                    response: {
                        status: '200 OK',
                        location: 'Patient/47135b80-b721-430b-9d4b-1557edc64947',
                        etag: '1',
                        lastModified: expect.stringMatching(utcTimeRegExp),
                    },
                },
                {
                    response: {
                        status: '200 OK',
                        location: 'Patient/bce8411e-c15e-448c-95dd-69155a837405',
                        etag: '1',
                        lastModified: expect.stringMatching(utcTimeRegExp),
                    },
                },
            ],
        };
        expect(actualResult).toMatchObject(expectedResult);
    });

    test('Bundle request is empty', async () => {
        const bundleRequestJSON = clone(sampleBundleRequestJSON);

        const actualResult = await bundleHandlerR4.processTransaction(bundleRequestJSON, practitionerDecoded);

        expect(actualResult).toMatchObject({
            resourceType: 'Bundle',
            id: expect.stringMatching(uuidRegExp),
            type: 'transaction-response',
            link: [
                {
                    relation: 'self',
                    url: 'https://API_URL.com',
                },
            ],
            entry: [],
        });
    });
});

describe('ERROR Cases: Bundle not authorized', () => {
    test('An entry in Bundle request is not authorized', async () => {
        const authZ: Authorization = {
            // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
            async isBundleRequestAuthorized(request) {
                throw new UnauthorizedError('An entry within the Bundle is not authorized');
            },
            async authorizeAndFilterReadResponse(request) {
                return request.readResponse;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async verifyAccessToken(request) {
                return {};
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
            async isWriteRequestAuthorized(request) {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
            async isAccessBulkDataJobAllowed(request: AccessBulkDataJobRequest) {},
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async getAllowedResourceTypesForOperation(request) {
                return [];
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async getSearchFilterBasedOnIdentity(request) {
                return [];
            },
        };
        const bundleHandlerWithStubbedAuthZ = new BundleHandler(
            DynamoDbBundleService,
            'https://API_URL.com',
            '4.0.1',
            authZ,
            getSupportedGenericResources(genericResource, SUPPORTED_R4_RESOURCES, '4.0.1'),
            genericResource,
            resources,
        );

        // Cloning
        const bundleRequestJSON = clone(sampleBundleRequestJSON);
        bundleRequestJSON.entry = bundleRequestJSON.entry.concat(sampleCrudEntries);

        await expect(
            bundleHandlerWithStubbedAuthZ.processTransaction(bundleRequestJSON, practitionerDecoded),
        ).rejects.toThrowError(new UnauthorizedError('An entry within the Bundle is not authorized'));
    });

    test('After filtering Bundle, read request is not Authorized', async () => {
        const authZ: Authorization = {
            async authorizeAndFilterReadResponse() {
                throw new UnauthorizedError('User does not have permission for requested resource');
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async verifyAccessToken(request) {
                return {};
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
            async isBundleRequestAuthorized(request) {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
            async isWriteRequestAuthorized(request) {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
            async isAccessBulkDataJobAllowed(request: AccessBulkDataJobRequest) {},
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async getAllowedResourceTypesForOperation(request) {
                return [];
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async getSearchFilterBasedOnIdentity(request) {
                return [];
            },
        };
        const bundleHandlerWithStubbedAuthZ = new BundleHandler(
            DynamoDbBundleService,
            'https://API_URL.com',
            '4.0.1',
            authZ,
            getSupportedGenericResources(genericResource, SUPPORTED_R4_RESOURCES, '4.0.1'),
            genericResource,
            resources,
        );

        // Cloning
        const bundleRequestJSON = clone(sampleBundleRequestJSON);
        bundleRequestJSON.entry = bundleRequestJSON.entry.concat(sampleCrudEntries);

        const expectedResult = {
            resourceType: 'Bundle',
            id: expect.stringMatching(uuidRegExp),
            type: 'transaction-response',
            link: [
                {
                    relation: 'self',
                    url: 'https://API_URL.com',
                },
            ],
            entry: [
                {
                    response: {
                        status: '200 OK',
                        location: 'Patient/8cafa46d-08b4-4ee4-b51b-803e20ae8126',
                        etag: '3',
                        lastModified: '2020-04-23T21:19:35.592Z',
                    },
                },
                {
                    response: {
                        status: '201 Created',
                        location: 'Patient/7c7cf4ca-4ba7-4326-b0dd-f3275b735827',
                        etag: '1',
                        lastModified: expect.stringMatching(utcTimeRegExp),
                    },
                },
                {
                    resource: {},
                    response: {
                        status: '403 Forbidden',
                        location: 'Patient/47135b80-b721-430b-9d4b-1557edc64947',
                        etag: '1',
                        lastModified: expect.stringMatching(utcTimeRegExp),
                    },
                },
                {
                    response: {
                        status: '200 OK',
                        location: 'Patient/bce8411e-c15e-448c-95dd-69155a837405',
                        etag: '1',
                        lastModified: expect.stringMatching(utcTimeRegExp),
                    },
                },
            ],
        };
        await expect(
            bundleHandlerWithStubbedAuthZ.processTransaction(bundleRequestJSON, practitionerDecoded),
        ).resolves.toMatchObject(expectedResult);
    });
});
describe('SERVER-CAPABILITIES Cases: Validating Bundle request is allowed given server capabilities', () => {
    beforeEach(() => {
        // Ensures that for each test, we test the assertions in the catch block
        expect.hasAssertions();
    });

    const bundleRequestJsonCreatePatient = clone(sampleBundleRequestJSON);
    bundleRequestJsonCreatePatient.entry = [
        {
            resource: {
                resourceType: 'Patient',
                name: [
                    {
                        family: 'Smith',
                        given: ['John'],
                    },
                ],
                gender: 'male',
            },
            request: {
                method: 'POST',
                url: 'Patient',
            },
        },
    ];

    // validator.ts doesn't validate Fhir V3 correctly, therefore the tests below will fail if we try to run them with
    // Fhir v3.
    const fhirfhirVersions: FhirVersion[] = ['4.0.1'];
    fhirfhirVersions.forEach((version: FhirVersion) => {
        const supportedResource = version === '4.0.1' ? SUPPORTED_R4_RESOURCES : SUPPORTED_STU3_RESOURCES;
        test(`FhirVersion: ${version}. Failed to operate on Bundle because server does not support Generic Resource for Patient  with operation Create`, async () => {
            // BUILD
            const genericResourceReadOnly: GenericResource = {
                operations: ['read'],
                fhirVersions: [version],
                persistence: DynamoDbDataService,
                typeHistory: stubs.history,
                typeSearch: stubs.search,
            };

            const bundleHandlerReadGenericResource = new BundleHandler(
                DynamoDbBundleService,
                'https://API_URL.com',
                version,
                stubs.passThroughAuthz,
                getSupportedGenericResources(genericResourceReadOnly, supportedResource, version),
                genericResourceReadOnly,
                resources,
            );

            try {
                // OPERATE
                await bundleHandlerReadGenericResource.processTransaction(
                    bundleRequestJsonCreatePatient,
                    practitionerDecoded,
                );
            } catch (e) {
                // CHECK
                expect(e.name).toEqual('BadRequestError');
                expect(e.statusCode).toEqual(400);
                expect(e.message).toEqual('Server does not support these resource and operations: {Patient: create}');
            }
        });

        test(`FhirVersion: ${version}. Failed to operate on Bundle because server does not support Generic Resource for Patient`, async () => {
            // BUILD
            const genericResourceExcludePatient: GenericResource = {
                operations: ['create', 'read', 'update', 'delete'],
                fhirVersions: [version],
                persistence: DynamoDbDataService,
                typeHistory: stubs.history,
                typeSearch: stubs.search,
            };
            if (version === '4.0.1') {
                genericResourceExcludePatient.excludedR4Resources = ['Patient'];
            } else {
                genericResourceExcludePatient.excludedSTU3Resources = ['Patient'];
            }

            const bundleHandlerExcludePatient = new BundleHandler(
                DynamoDbBundleService,
                'https://API_URL.com',
                version,
                stubs.passThroughAuthz,
                getSupportedGenericResources(genericResourceExcludePatient, supportedResource, version),
                genericResourceExcludePatient,
                resources,
            );

            try {
                // OPERATE
                await bundleHandlerExcludePatient.processTransaction(
                    bundleRequestJsonCreatePatient,
                    practitionerDecoded,
                );
            } catch (e) {
                // CHECK
                expect(e.name).toEqual('BadRequestError');
                expect(e.statusCode).toEqual(400);
                expect(e.message).toEqual('Server does not support these resource and operations: {Patient: create}');
            }
        });

        // For now, entries in Bundle must be generic resource, because only one persistence obj can be passed into
        // bundleParser
        test.skip(`FhirVersion: ${version}. Succeed because Generic Resource exclude Patient but Special Resource support Patient`, async () => {
            // BUILD
            const genericResourceExcludePatient: GenericResource = {
                operations: ['create', 'read', 'update', 'delete'],
                fhirVersions: [version],
                persistence: DynamoDbDataService,
                typeHistory: stubs.history,
                typeSearch: stubs.search,
            };
            if (version === '4.0.1') {
                genericResourceExcludePatient.excludedR4Resources = ['Patient'];
            } else {
                genericResourceExcludePatient.excludedSTU3Resources = ['Patient'];
            }

            const patientResource: Resources = {
                Patient: {
                    operations: ['create'],
                    fhirVersions: [version],
                    persistence: DynamoDbDataService,
                    typeSearch: stubs.search,
                    typeHistory: stubs.history,
                },
            };

            const bundleHandlerSpecialResourcePatient = new BundleHandler(
                DynamoDbBundleService,
                'https://API_URL.com',
                version,
                stubs.passThroughAuthz,
                getSupportedGenericResources(genericResourceExcludePatient, supportedResource, version),
                genericResourceExcludePatient,
                patientResource,
            );

            // OPERATE
            const result = await bundleHandlerSpecialResourcePatient.processTransaction(
                bundleRequestJsonCreatePatient,
                practitionerDecoded,
            );

            // CHECK
            expect(result).toBeTruthy();
        });
        test(`FhirVersion: ${version}. Succeed because Generic Resource does not exclude Patient`, async () => {
            // BUILD
            const genericResourceNoExclusion: GenericResource = {
                operations: ['create', 'read', 'update', 'delete'],
                fhirVersions: [version],
                persistence: DynamoDbDataService,
                typeHistory: stubs.history,
                typeSearch: stubs.search,
            };

            const bundleHandlerNoExclusion = new BundleHandler(
                DynamoDbBundleService,
                'https://API_URL.com',
                version,
                stubs.passThroughAuthz,
                getSupportedGenericResources(genericResourceNoExclusion, supportedResource, version),
                genericResourceNoExclusion,
                {},
            );

            // OPERATE
            const result = await bundleHandlerNoExclusion.processTransaction(
                bundleRequestJsonCreatePatient,
                practitionerDecoded,
            );

            // CHECK
            expect(result).toBeTruthy();
        });
    });
});
