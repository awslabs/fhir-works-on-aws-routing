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

export type GetAllowEndpoints = () => Promise<SubscriptionEndpoint[]>;

const SUBSCRIPTION_RESOURCE_TYPE = 'Subscription';

const BUNDLE_RESOURCE_TYPE = 'Bundle';

const SINGLE_TENANT_ALLOW_LIST_KEY = 'SINGLE_TENANT_ALLOW_LIST_KEY';

export default class SubscriptionValidator implements Validator {
    private ajv: Ajv.Ajv;

    private validateJSON: Ajv.ValidateFunction;

    private search: Search;

    private allowListMap: { [key: string]: (string | RegExp)[] } = {};

    private allowListLoaded = false;

    private readonly getSubscriptionAllowEndpoint: GetAllowEndpoints;

    private readonly enableMultiTenancy: boolean;

    constructor(search: Search, getSubscriptionAllowEndpoint: GetAllowEndpoints, enableMultiTenancy: boolean) {
        this.search = search;
        this.getSubscriptionAllowEndpoint = getSubscriptionAllowEndpoint;
        this.enableMultiTenancy = enableMultiTenancy;
        this.ajv = new Ajv();
        this.validateJSON = this.ajv.compile(subscriptionSchema);
    }

    async loadAllowList() {
        const allowEndpoints: SubscriptionEndpoint[] = await this.getSubscriptionAllowEndpoint();
        if (!this.enableMultiTenancy) {
            this.allowListMap = {
                [SINGLE_TENANT_ALLOW_LIST_KEY]: allowEndpoints.map(
                    (allowEndpoint: SubscriptionEndpoint) => allowEndpoint.endpoint,
                ),
            };
        } else {
            const endpointsGroupByTenant: { [key: string]: SubscriptionEndpoint[] } = groupBy(
                allowEndpoints,
                (allowEndpoint: SubscriptionEndpoint) => allowEndpoint.tenantId,
            );
            Object.entries(endpointsGroupByTenant).forEach(([key, value]) => {
                this.allowListMap[key] = value.map((v) => v.endpoint);
            });
        }
        this.allowListLoaded = true;
    }

    async validate(resource: any, tenantId?: string): Promise<void> {
        const resourcesToValidate: any[] = this.filterResourcesToValidate(resource);
        if (isEmpty(resourcesToValidate)) {
            return;
        }
        if (!this.allowListLoaded) {
            await this.loadAllowList();
        }
        const allowList: (string | RegExp)[] = this.getAllowListForRequest(tenantId);

        resourcesToValidate.forEach((res) => {
            const result = this.validateJSON(res);
            if (!result) {
                throw new InvalidResourceError(
                    `Subscription resource is not valid. Error was: ${this.ajv.errorsText(this.validateJSON.errors)}`,
                );
            }
            if (!this.isEndpointAllowListed(allowList, res.channel.endpoint)) {
                throw new InvalidResourceError(
                    `Subscription resource is not valid. Endpoint ${res.channel.endpoint} is not allow listed.`,
                );
            }
            this.search.validateSubscriptionSearchCriteria(res.criteria);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    private isEndpointAllowListed(allowList: (string | RegExp)[], endpoint: string): boolean {
        return allowList.some((allowedEndpoint) => {
            if (allowedEndpoint instanceof RegExp) {
                return allowedEndpoint.test(endpoint);
            }
            return allowedEndpoint === endpoint;
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

    // eslint-disable-next-line class-methods-use-this
    private filterResourcesToValidate(resource: any): any[] {
        const { resourceType } = resource;
        let resourcesToValidate: any[] = [];
        if (resourceType === SUBSCRIPTION_RESOURCE_TYPE) {
            resourcesToValidate = [resource];
        } else if (resourceType === BUNDLE_RESOURCE_TYPE) {
            resourcesToValidate = resource.entry
                .map((ent: { resource: any }) => ent.resource)
                .filter(
                    (singleResource: { resourceType: string }) =>
                        singleResource && singleResource.resourceType === SUBSCRIPTION_RESOURCE_TYPE,
                );
        }
        return resourcesToValidate;
    }
}
