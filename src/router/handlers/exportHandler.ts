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

    // eslint-disable-next-line class-methods-use-this
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
        // const jobId = await this.dataService.initiateExport(initiateExportRequest);

        const jobId = 10;
        return jobId;
    }

    async getExportJobStatus(jobId: string) {
        const response = await this.dataService.getExportStatus(jobId);
        return response;
    }

    async cancelExport(jobId: string) {
        await this.dataService.cancelExport(jobId);
    }
}
