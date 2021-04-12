/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Search, History, KeyValueMap, Authorization } from 'fhir-works-on-aws-interface';
import BundleGenerator from '../bundle/bundleGenerator';

export default class RootHandler {
    private searchService: Search;

    private historyService: History;

    private authService: Authorization;

    private serverUrl: string;

    constructor(searchService: Search, historyService: History, authService: Authorization, serverUrl: string) {
        this.searchService = searchService;
        this.historyService = historyService;
        this.authService = authService;
        this.serverUrl = serverUrl;
    }

    async globalSearch(queryParams: any, userIdentity: KeyValueMap) {
        const searchFilters = await this.authService.getSearchFilterBasedOnIdentity({
            userIdentity,
            operation: 'search-system',
        });
        const searchResponse = await this.searchService.globalSearch({
            queryParams,
            baseUrl: this.serverUrl,
            searchFilters,
        });
        return BundleGenerator.generateBundle(this.serverUrl, queryParams, searchResponse.result, 'searchset');
    }

    async globalHistory(queryParams: any, userIdentity: KeyValueMap) {
        const searchFilters = await this.authService.getSearchFilterBasedOnIdentity({
            userIdentity,
            operation: 'history-system',
        });
        const historyResponse = await this.historyService.globalHistory({
            queryParams,
            baseUrl: this.serverUrl,
            searchFilters,
        });
        return BundleGenerator.generateBundle(this.serverUrl, queryParams, historyResponse.result, 'history');
    }
}
