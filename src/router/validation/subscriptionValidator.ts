/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Ajv from 'ajv';
// @ts-ignore
import ajvErrors from 'ajv-errors';

import { isEmpty, groupBy } from 'lodash';

import { InvalidResourceError, Validator, Search, VerbType, Persistence } from 'fhir-works-on-aws-interface';
import subscriptionSchema from './subscriptionSchema.json';

export interface SubscriptionEndpoint {
    endpoint: string | RegExp;
    headers?: string[];
    tenantId?: string;
}

const SUBSCRIPTION_RESOURCE_TYPE = 'Subscription';

const BUNDLE_RESOURCE_TYPE = 'Bundle';

const SINGLE_TENANT_ALLOW_LIST_KEY = 'SINGLE_TENANT_ALLOW_LIST_KEY';

const ALLOWED_NUMBER_OF_ACTIVE_SUBSCRIPTIONS = 300;

const isEndpointAllowListed = (allowList: (string | RegExp)[], endpoint: string): boolean => {
    return allowList.some((allowedEndpoint) => {
        if (allowedEndpoint instanceof RegExp) {
            return allowedEndpoint.test(endpoint);
        }
        return allowedEndpoint === endpoint;
    });
};

const extractSubscriptionResources = (
    resource: any,
    httpVerb?: VerbType,
): { subscriptionResources: any[]; numberOfPOSTSubscription: number; errorMessageIfExceedsNumberLimit: string } => {
    const { resourceType } = resource;
    let subscriptionResources = [];
    let numberOfPOSTSubscription = 0;
    let errorMessageIfExceedsNumberLimit = `Number of active subscriptions are exceeding the limit of ${ALLOWED_NUMBER_OF_ACTIVE_SUBSCRIPTIONS}`;
    if (resourceType === SUBSCRIPTION_RESOURCE_TYPE) {
        subscriptionResources = [resource];
        numberOfPOSTSubscription = httpVerb === 'POST' ? 1 : 0;
    }
    if (resourceType === BUNDLE_RESOURCE_TYPE) {
        subscriptionResources = resource.entry
            .map((ent: { resource: any }) => ent.resource)
            .filter(
                (singleResource: { resourceType: string }) =>
                    singleResource && singleResource.resourceType === SUBSCRIPTION_RESOURCE_TYPE,
            );
        // Here we're NOT considering active subscriptions that might be deleted or deactivated as part of the bundle for simplicity
        numberOfPOSTSubscription = resource.entry.filter((ent: any) => ent.request.method === 'POST').length;
        errorMessageIfExceedsNumberLimit = `Number of active subscriptions are exceeding the limit of ${ALLOWED_NUMBER_OF_ACTIVE_SUBSCRIPTIONS}. Please delete or deactivate subscriptions first, then create new Subscriptions in another request.`;
    }
    return { subscriptionResources, numberOfPOSTSubscription, errorMessageIfExceedsNumberLimit };
};

export default class SubscriptionValidator implements Validator {
    private ajv: Ajv.Ajv;

    private readonly validateJSON: Ajv.ValidateFunction;

    private search: Search;

    private persistence: Persistence;

    private allowListMap: { [key: string]: (string | RegExp)[] } = {};

    private readonly enableMultiTenancy: boolean;

    constructor(
        search: Search,
        persistence: Persistence,
        allowList: SubscriptionEndpoint[],
        { enableMultiTenancy = false }: { enableMultiTenancy?: boolean } = {},
    ) {
        this.search = search;
        this.persistence = persistence;
        this.enableMultiTenancy = enableMultiTenancy;
        this.loadAllowList(allowList);
        this.ajv = ajvErrors(new Ajv({ allErrors: true, jsonPointers: true }));
        this.validateJSON = this.ajv.compile(subscriptionSchema);
    }

    loadAllowList(allowList: SubscriptionEndpoint[]) {
        if (!this.enableMultiTenancy) {
            this.allowListMap = {
                [SINGLE_TENANT_ALLOW_LIST_KEY]: allowList.map(
                    (allowEndpoint: SubscriptionEndpoint) => allowEndpoint.endpoint,
                ),
            };
        } else {
            const endpointsGroupByTenant: { [key: string]: SubscriptionEndpoint[] } = groupBy(
                allowList,
                (allowEndpoint: SubscriptionEndpoint) => allowEndpoint.tenantId,
            );
            Object.entries(endpointsGroupByTenant).forEach(([key, value]) => {
                this.allowListMap[key] = value.map((v) => v.endpoint);
            });
        }
    }

    async validate(resource: any, params: { tenantId?: string; httpVerb?: VerbType } = {}): Promise<void> {
        const { subscriptionResources, numberOfPOSTSubscription, errorMessageIfExceedsNumberLimit } =
            extractSubscriptionResources(resource, params.httpVerb);
        if (isEmpty(subscriptionResources)) {
            return;
        }
        const numberOfActiveSubscriptions = (
            await this.persistence.getActiveSubscriptions({ tenantId: params.tenantId })
        ).length;
        if (numberOfActiveSubscriptions + numberOfPOSTSubscription > ALLOWED_NUMBER_OF_ACTIVE_SUBSCRIPTIONS) {
            throw new Error(errorMessageIfExceedsNumberLimit);
        }
        const allowList: (string | RegExp)[] = this.getAllowListForRequest(params.tenantId);

        subscriptionResources.forEach((res) => {
            const result = this.validateJSON(res);
            if (!result) {
                throw new InvalidResourceError(
                    `Subscription resource is not valid. Error was: ${this.ajv.errorsText(this.validateJSON.errors)}`,
                );
            }
            if (!isEndpointAllowListed(allowList, res.channel.endpoint)) {
                throw new InvalidResourceError(
                    `Subscription resource is not valid. Endpoint ${res.channel.endpoint} is not allow listed.`,
                );
            }
            this.search.validateSubscriptionSearchCriteria(res.criteria);
        });
    }

    private getAllowListForRequest(tenantId?: string): (string | RegExp)[] {
        if (this.enableMultiTenancy) {
            if (tenantId !== undefined) {
                return this.allowListMap[tenantId];
            }
            throw new Error('This instance has multi-tenancy enabled, but the incoming request is missing tenantId');
        } else {
            if (tenantId === undefined) {
                return this.allowListMap[SINGLE_TENANT_ALLOW_LIST_KEY];
            }
            throw new Error('This instance has multi-tenancy disabled, but the incoming request has a tenantId');
        }
    }
}
