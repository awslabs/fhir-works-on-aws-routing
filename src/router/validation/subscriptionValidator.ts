/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Ajv from 'ajv';
import { isEmpty, groupBy } from 'lodash';

import { InvalidResourceError, Validator, Search } from 'fhir-works-on-aws-interface';
import subscriptionSchema from './subscriptionSchema.json';

export interface SubscriptionEndpoint {
    endpoint: string | RegExp;
    headers?: string[];
    tenantId?: string;
}

const SUBSCRIPTION_RESOURCE_TYPE = 'Subscription';

const BUNDLE_RESOURCE_TYPE = 'Bundle';

const SINGLE_TENANT_ALLOW_LIST_KEY = 'SINGLE_TENANT_ALLOW_LIST_KEY';

const isEndpointAllowListed = (allowList: (string | RegExp)[], endpoint: string): boolean => {
    return allowList.some((allowedEndpoint) => {
        if (allowedEndpoint instanceof RegExp) {
            return allowedEndpoint.test(endpoint);
        }
        return allowedEndpoint === endpoint;
    });
};

const extractSubscriptionResources = (resource: any): any[] => {
    const { resourceType } = resource;
    if (resourceType === SUBSCRIPTION_RESOURCE_TYPE) {
        return [resource];
    }
    if (resourceType === BUNDLE_RESOURCE_TYPE) {
        return resource.entry
            .map((ent: { resource: any }) => ent.resource)
            .filter(
                (singleResource: { resourceType: string }) =>
                    singleResource && singleResource.resourceType === SUBSCRIPTION_RESOURCE_TYPE,
            );
    }
    return [];
};

export default class SubscriptionValidator implements Validator {
    private ajv: Ajv.Ajv;

    private readonly validateJSON: Ajv.ValidateFunction;

    private search: Search;

    private allowListMap: { [key: string]: (string | RegExp)[] } = {};

    private readonly enableMultiTenancy: boolean;

    constructor(search: Search, allowList: SubscriptionEndpoint[], enableMultiTenancy: boolean) {
        this.search = search;
        this.enableMultiTenancy = enableMultiTenancy;
        this.loadAllowList(allowList);
        this.ajv = new Ajv();
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

    async validate(resource: any, tenantId?: string): Promise<void> {
        const resourcesToValidate: any[] = extractSubscriptionResources(resource);
        if (isEmpty(resourcesToValidate)) {
            return;
        }
        const allowList: (string | RegExp)[] = this.getAllowListForRequest(tenantId);

        resourcesToValidate.forEach((res) => {
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
