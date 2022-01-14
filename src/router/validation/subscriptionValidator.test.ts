/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidResourceError, Search } from 'fhir-works-on-aws-interface';
import ElasticSearchService from '../__mocks__/elasticSearchService';
import SubscriptionValidator, { GetAllowEndpoints, SubscriptionEndpoint } from './subscriptionValidator';
import validPatient from '../../../sampleData/validV4Patient.json';
import invalidPatient from '../../../sampleData/invalidV4Patient.json';

const search: Search = ElasticSearchService;

const getSubscriptionResource = (endpoint: string) => {
    return {
        resourceType: 'Subscription',
        status: 'requested',
        reason: 'Monitor Patients for Organization 123',
        criteria: 'Patient?managing-organization=Organization/123',
        channel: {
            type: 'rest-hook',
            endpoint,
            payload: 'application/fhir+json',
            header: ['Authorization: Bearer secret-token-abc-123'],
        },
    };
};

const getBundleResource = (resourceToAdd: { resourceType: string }) => {
    return {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
            {
                fullUrl: 'urn:uuid:some-fake-uuid',
                resource: invalidPatient,
                request: {
                    method: 'POST',
                    url: 'Patient',
                },
            },
            {
                fullUrl: 'urn:uuid:another-fake-uuid',
                resource: resourceToAdd,
                request: {
                    method: 'POST',
                    url: resourceToAdd.resourceType,
                },
            },
            {
                request: {
                    method: 'DELETE',
                    url: 'Patient/some-fake-id',
                },
            },
        ],
    };
};

describe('Multi-tenancy mold: Validating Subscriptions', () => {
    const allowedEndpoints: SubscriptionEndpoint[] = [
        {
            endpoint: 'https://fake-end-point-tenant1',
            headers: ['header-name: header-value'],
            tenantId: 'tenant1',
        },
        {
            endpoint: new RegExp('^https://fake-end-point-tenant2'),
            headers: ['header-name: header-value'],
            tenantId: 'tenant2',
        },
    ];
    const getAllowEndpoints: GetAllowEndpoints = jest.fn().mockResolvedValue(allowedEndpoints);
    const subscriptionValidator = new SubscriptionValidator(search, getAllowEndpoints, true);

    test('No error when validating valid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-tenant1');
        await expect(subscriptionValidator.validate(subscription, 'tenant1')).resolves.toEqual(undefined);
    });

    test('No error when validating valid Bundle resource that contains valid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-tenant2');
        const bundle = getBundleResource(subscription);
        await expect(subscriptionValidator.validate(bundle, 'tenant2')).resolves.toEqual(undefined);
    });

    test('No error when validating resources that are not Subscription or Bundle', async () => {
        await expect(subscriptionValidator.validate(invalidPatient, 'tenant1')).resolves.toEqual(undefined);
    });

    test('No error when validating Bundle that does not contain Subscription resource', async () => {
        const bundle = getBundleResource(validPatient);
        await expect(subscriptionValidator.validate(bundle, 'tenant2')).resolves.toEqual(undefined);
    });

    test('Show error when validating invalid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-tenant1');
        subscription.status = 'active';
        await expect(subscriptionValidator.validate(subscription, 'tenant1')).rejects.toThrowError(
            new InvalidResourceError(
                'Subscription resource is not valid. Error was: data.status should be equal to one of the allowed values',
            ),
        );
    });

    test('Show error when endpoint is not allow listed', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-tenant1');
        await expect(subscriptionValidator.validate(subscription, 'tenant2')).rejects.toThrowError(
            new InvalidResourceError(
                'Subscription resource is not valid. Endpoint https://fake-end-point-tenant1 is not allow listed.',
            ),
        );
    });

    test('Show error when validating Bundle resource that has invalid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-tenant1');
        subscription.channel.type = 'email';
        const bundle = getBundleResource(subscription);
        await expect(subscriptionValidator.validate(bundle, 'tenant1')).rejects.toThrowError(
            new InvalidResourceError(
                'Subscription resource is not valid. Error was: data.channel.type should be equal to constant',
            ),
        );
    });

    test('Show error when tenantId is undefined', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-tenant1');
        await expect(subscriptionValidator.validate(subscription)).rejects.toThrowError(
            new InvalidResourceError(
                'This instance has multi-tenancy enabled, but the incoming request is missing tenantId',
            ),
        );
    });
});

describe('Single-tenancy mold: Validating Subscriptions', () => {
    const allowedEndpoints: SubscriptionEndpoint[] = [
        {
            endpoint: 'https://fake-end-point-1',
            headers: ['header-name: header-value'],
        },
        {
            endpoint: new RegExp('^https://fake-end-point-2'),
            headers: ['header-name: header-value'],
        },
    ];
    const getAllowEndpoints: GetAllowEndpoints = jest.fn().mockResolvedValue(allowedEndpoints);
    const subscriptionValidator = new SubscriptionValidator(search, getAllowEndpoints, false);

    test('No error when validating valid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-1');
        await expect(subscriptionValidator.validate(subscription)).resolves.toEqual(undefined);
    });

    test('No error when validating valid Bundle resource that contains valid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-2');
        const bundle = getBundleResource(subscription);
        await expect(subscriptionValidator.validate(bundle)).resolves.toEqual(undefined);
    });

    test('No error when validating resources that are not Subscription or Bundle', async () => {
        await expect(subscriptionValidator.validate(invalidPatient)).resolves.toEqual(undefined);
    });

    test('No error when validating Bundle that does not contain Subscription resource', async () => {
        const bundle = getBundleResource(validPatient);
        await expect(subscriptionValidator.validate(bundle)).resolves.toEqual(undefined);
    });

    test('Show error when validating invalid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-1');
        subscription.status = 'active';
        await expect(subscriptionValidator.validate(subscription)).rejects.toThrowError(
            new InvalidResourceError(
                'Subscription resource is not valid. Error was: data.status should be equal to one of the allowed values',
            ),
        );
    });

    test('Show error when endpoint is not allow listed', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-3');
        await expect(subscriptionValidator.validate(subscription)).rejects.toThrowError(
            new InvalidResourceError(
                'Subscription resource is not valid. Endpoint https://fake-end-point-3 is not allow listed.',
            ),
        );
    });

    test('Show error when validating Bundle resource that has invalid Subscription resource', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-1');
        subscription.channel.type = 'email';
        const bundle = getBundleResource(subscription);
        await expect(subscriptionValidator.validate(bundle)).rejects.toThrowError(
            new InvalidResourceError(
                'Subscription resource is not valid. Error was: data.channel.type should be equal to constant',
            ),
        );
    });

    test('Show error when tenantId is defined', async () => {
        const subscription = getSubscriptionResource('https://fake-end-point-1');
        await expect(subscriptionValidator.validate(subscription, 'tenant1')).rejects.toThrowError(
            new InvalidResourceError(
                'This instance has multi-tenancy disabled, but the incoming request has a tenantId',
            ),
        );
    });
});
