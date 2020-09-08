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
        outputFormat?: string,
        since?: number,
        type?: string,
        groupId?: string,
    ) {
        const initiateExportRequest: InitiateExportRequest = {
            requesterUserId,
            requestGranularity,
            transactionTime: Math.floor(Date.now() / 1000),
            outputFormat,
            since,
            type,
        };

        if (groupId) {
            initiateExportRequest.groupId = groupId;
        }

        const jobId = await this.dataService.initiateExport(initiateExportRequest);

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
