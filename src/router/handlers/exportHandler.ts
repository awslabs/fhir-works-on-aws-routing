/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BulkDataAccess, GetExportStatusResponse, InitiateExportRequest } from 'fhir-works-on-aws-interface';

export default class ExportHandler {
    private bulkDataAccess: BulkDataAccess;

    constructor(bulkDataAccess: BulkDataAccess) {
        this.bulkDataAccess = bulkDataAccess;
    }

    // eslint-disable-next-line class-methods-use-this
    async initiateExport(initiateExportRequest: InitiateExportRequest): Promise<string> {
        return this.bulkDataAccess.initiateExport(initiateExportRequest);
    }

    async getExportJobStatus(jobId: string): Promise<GetExportStatusResponse> {
        return this.bulkDataAccess.getExportStatus(jobId);
    }

    async cancelExport(jobId: string): Promise<void> {
        await this.bulkDataAccess.cancelExport(jobId);
    }
}
