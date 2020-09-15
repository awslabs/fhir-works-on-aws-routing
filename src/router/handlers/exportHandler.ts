/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
    Authorization,
    BulkDataAccess,
    GetExportStatusResponse,
    InitiateExportRequest,
} from 'fhir-works-on-aws-interface';
import createError from 'http-errors';

export default class ExportHandler {
    private bulkDataAccess: BulkDataAccess;

    private authService: Authorization;

    constructor(bulkDataAccess: BulkDataAccess, authService: Authorization) {
        this.bulkDataAccess = bulkDataAccess;
        this.authService = authService;
    }

    async initiateExport(initiateExportRequest: InitiateExportRequest): Promise<string> {
        return this.bulkDataAccess.initiateExport(initiateExportRequest);
    }

    async getExportJobStatus(jobId: string, requesterUserId: string): Promise<GetExportStatusResponse> {
        const jobDetails = await this.bulkDataAccess.getExportStatus(jobId);
        await this.checkIfRequesterHasAccessToJob(jobDetails, requesterUserId);
        return jobDetails;
    }

    async cancelExport(jobId: string, requesterUserId: string): Promise<void> {
        const jobDetails = await this.bulkDataAccess.getExportStatus(jobId);
        await this.checkIfRequesterHasAccessToJob(jobDetails, requesterUserId);

        await this.bulkDataAccess.cancelExport(jobId);
    }

    private async checkIfRequesterHasAccessToJob(jobDetails: GetExportStatusResponse, requesterUserId: string) {
        const { jobOwnerId } = jobDetails;
        const isAllowed: boolean = await this.authService.isAllowedToAccessBulkDataJob(requesterUserId, jobOwnerId);
        if (!isAllowed) {
            throw new createError.Forbidden('Forbidden');
        }
    }
}
