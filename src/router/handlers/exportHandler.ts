/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ExportRequestGranularity, InitiateExportRequest, Persistence } from 'fhir-works-on-aws-interface';

export default class ExportHandler {
    private dataService: Persistence;

    constructor(dataService: Persistence) {
        this.dataService = dataService;
    }

    async initiateExportRequest(
        requesterUserId: string,
        requestGranularity: ExportRequestGranularity,
        requestQueryParams: { _outputFormat: string; _since: number; _type: string },
        groupId?: string,
    ) {
        const initiateExportRequest: InitiateExportRequest = {
            requesterUserId,
            requestGranularity,
            transactionTime: Math.floor(Date.now() / 1000),
            requestQueryParams,
        };

        if (groupId) {
            initiateExportRequest.groupId = groupId;
        }

        console.log('initiateExportRequest', initiateExportRequest);
        // await this.dataService.initiateExport(initiateExportRequest);

        return initiateExportRequest;
    }
}
