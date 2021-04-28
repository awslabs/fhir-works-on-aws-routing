/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-underscore-dangle */
import express, { Router } from 'express';
import {
    Authorization,
    BulkDataAccess,
    ExportType,
    InitiateExportRequest,
    RequestContext
} from 'fhir-works-on-aws-interface';
import createHttpError from 'http-errors';
import RouteHelper from './routeHelper';
import ExportHandler from '../handlers/exportHandler';
import ExportRouteHelper from './exportRouteHelper';

export default class ExportRoute {
    readonly router: Router;

    private exportHandler: any;

    private serverUrl: string;

    constructor(serverUrl: string, bulkDataAccess: BulkDataAccess, authService: Authorization) {
        this.router = express.Router();
        this.serverUrl = serverUrl;
        this.exportHandler = new ExportHandler(bulkDataAccess, authService);
        this.init();
    }

    async initiateExportRequests(req: express.Request, res: express.Response, exportType: ExportType) {
        const initiateExportRequest: InitiateExportRequest = ExportRouteHelper.buildInitiateExportRequest(
            req,
            res,
            exportType,
        );
        const jobId = await this.exportHandler.initiateExport(initiateExportRequest);

        const exportStatusUrl = `${this.serverUrl}/$export/${jobId}`;
        res.header('Content-Location', exportStatusUrl)
            .status(202)
            .send();
    }

    init() {
        // Start export job
        this.router.get(
            '/\\$export',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const exportType: ExportType = 'system';
                await this.initiateExportRequests(req, res, exportType);
            }),
        );

        this.router.get('/Patient/\\$export', () => {
            throw new createHttpError.BadRequest('We currently do not support Patient export');
        });

        this.router.get('/Group/:id/\\$export', () => {
            throw new createHttpError.BadRequest('We currently do not support Group export');
        });

        // Export Job Status
        this.router.get(
            '/\\$export/:jobId',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const { userIdentity, requestContext } = res.locals;
                const { jobId } = req.params;
                const response = await this.exportHandler.getExportJobStatus(jobId, userIdentity, requestContext);
                if (response.jobStatus === 'in-progress') {
                    res.status(202)
                        .header('x-progress', 'in-progress')
                        .send();
                } else if (response.jobStatus === 'failed') {
                    throw new createHttpError.InternalServerError(response.errorMessage);
                } else if (response.jobStatus === 'completed') {
                    const { outputFormat, since, type, groupId } = response;
                    const queryParams = { outputFormat, since, type };
                    const jsonResponse = {
                        transactionTime: response.transactionTime,
                        request: ExportRouteHelper.getExportUrl(
                            this.serverUrl,
                            response.exportType,
                            queryParams,
                            groupId,
                        ),
                        requiresAccessToken: false,
                        output: response.exportedFileUrls,
                        error: response.errorArray,
                    };
                    res.status(200).send(jsonResponse);
                } else if (response.jobStatus === 'canceled') {
                    res.send('Export job has been canceled');
                } else if (response.jobStatus === 'canceling') {
                    res.send('Export job is being canceled');
                }
            }),
        );

        // Cancel export job
        this.router.delete(
            '/\\$export/:jobId',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const { jobId } = req.params;
                const { userIdentity, requestContext } = res.locals;
                await this.exportHandler.cancelExport(jobId, userIdentity, requestContext);
                res.status(202).send();
            }),
        );
    }
}
