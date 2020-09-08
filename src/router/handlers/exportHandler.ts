/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetExportStatusResponse, InitiateExportRequest, Persistence } from 'fhir-works-on-aws-interface';

export default class ExportHandler {
    private dataService: Persistence;

    constructor(dataService: Persistence) {
        this.dataService = dataService;
    }

    // eslint-disable-next-line class-methods-use-this
    async initiateExport(initiateExportRequest: InitiateExportRequest): Promise<string> {
        return this.dataService.initiateExport(initiateExportRequest);
    }

    async getExportJobStatus(jobId: string): Promise<GetExportStatusResponse> {
        return this.dataService.getExportStatus(jobId);
    }

    async cancelExport(jobId: string): Promise<void> {
        await this.dataService.cancelExport(jobId);
    }
}
