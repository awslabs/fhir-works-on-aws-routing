/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Search, History, Persistence, FhirVersion, Authorization, KeyValueMap } from 'fhir-works-on-aws-interface';
import BundleGenerator from '../bundle/bundleGenerator';
import CrudHandlerInterface from './CrudHandlerInterface';
import OperationsGenerator from '../operationsGenerator';
import Validator from '../validation/validator';

export default class ResourceHandler implements CrudHandlerInterface {
    private validator: Validator;

    private dataService: Persistence;

    private searchService: Search;

    private historyService: History;

    private authService: Authorization;

    private serverUrl: string;

    constructor(
        dataService: Persistence,
        searchService: Search,
        historyService: History,
        authService: Authorization,
        fhirVersion: FhirVersion,
        serverUrl: string,
    ) {
        this.validator = new Validator(fhirVersion);
        this.dataService = dataService;
        this.searchService = searchService;
        this.historyService = historyService;
        this.authService = authService;
        this.serverUrl = serverUrl;
    }

    async create(resourceType: string, resource: any) {
        this.validator.validate(resourceType, resource);

        const createResponse = await this.dataService.createResource({ resourceType, resource });
        return createResponse.resource;
    }

    async update(resourceType: string, id: string, resource: any) {
        this.validator.validate(resourceType, resource);

        const updateResponse = await this.dataService.updateResource({ resourceType, id, resource });
        return updateResponse.resource;
    }

    async patch(resourceType: string, id: string, resource: any) {
        // TODO Add request validation around patching
        const patchResponse = await this.dataService.patchResource({ resourceType, id, resource });

        return patchResponse.resource;
    }

    async typeSearch(
        resourceType: string,
        queryParams: any,
        allowedResourceTypes: string[],
        userIdentity: KeyValueMap,
    ) {
        const searchFilters = await this.authService.getSearchFilterBasedOnIdentity({
            userIdentity,
            operation: 'search-type',
            resourceType,
        });

        const searchResponse = await this.searchService.typeSearch({
            resourceType,
            queryParams,
            baseUrl: this.serverUrl,
            allowedResourceTypes,
            searchFilters,
        });
        return BundleGenerator.generateBundle(
            this.serverUrl,
            queryParams,
            searchResponse.result,
            'searchset',
            resourceType,
        );
    }

    async typeHistory(resourceType: string, queryParams: any, userIdentity: KeyValueMap) {
        const searchFilters = await this.authService.getSearchFilterBasedOnIdentity({
            userIdentity,
            operation: 'history-type',
            resourceType,
        });

        const historyResponse = await this.historyService.typeHistory({
            resourceType,
            queryParams,
            baseUrl: this.serverUrl,
            searchFilters,
        });
        return BundleGenerator.generateBundle(
            this.serverUrl,
            queryParams,
            historyResponse.result,
            'history',
            resourceType,
        );
    }

    async instanceHistory(resourceType: string, id: string, queryParams: any, userIdentity: KeyValueMap) {
        const searchFilters = await this.authService.getSearchFilterBasedOnIdentity({
            userIdentity,
            operation: 'history-instance',
            resourceType,
            id,
        });

        const historyResponse = await this.historyService.instanceHistory({
            id,
            resourceType,
            queryParams,
            baseUrl: this.serverUrl,
            searchFilters,
        });
        return BundleGenerator.generateBundle(
            this.serverUrl,
            queryParams,
            historyResponse.result,
            'history',
            resourceType,
            id,
        );
    }

    async read(resourceType: string, id: string) {
        const getResponse = await this.dataService.readResource({ resourceType, id });
        return getResponse.resource;
    }

    async vRead(resourceType: string, id: string, vid: string) {
        const getResponse = await this.dataService.vReadResource({ resourceType, id, vid });
        return getResponse.resource;
    }

    async delete(resourceType: string, id: string) {
        await this.dataService.deleteResource({ resourceType, id });
        return OperationsGenerator.generateSuccessfulDeleteOperation();
    }
}
