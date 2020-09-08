/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-underscore-dangle */
import express, { Router } from 'express';
import { ExportType, InitiateExportRequest, Persistence } from 'fhir-works-on-aws-interface';
import isString from 'lodash/isString';
import createHttpError from 'http-errors';
import RouteHelper from './routeHelper';
import ExportHandler from '../handlers/exportHandler';

export default class ExportRoute {
    readonly router: Router;

    private exportHandler: any;

    private serverUrl: string;

    constructor(serverUrl: string, persistence: Persistence) {
        this.router = express.Router();
        this.serverUrl = serverUrl;
        // @ts-ignore
        this.exportHandler = new ExportHandler(persistence);
        this.init();
    }

    async initiateExportRequests(req: express.Request, res: express.Response, requestGranularity: ExportType) {
        if (req.query._outputFormat && req.query._outputFormat !== 'ndjson') {
            throw new createHttpError.BadRequest('We only support exporting resources into ndjson formatted file');
        }
        const { requesterUserId } = res.locals;

        const initiateExportRequest: InitiateExportRequest = {
            requesterUserId,
            requestGranularity,
            transactionTime: Math.floor(Date.now() / 1000),
            outputFormat: isString(req.query._outputFormat) ? req.query._outputFormat : undefined,
            since: Number(req.query._since) ? Number(req.query._since) : undefined,
            type: isString(req.query._type) ? req.query._type : undefined,
            groupId: isString(req.params.id) ? req.params.id : undefined,
        };

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
                const requestGranularity: ExportType = 'system';
                await this.initiateExportRequests(req, res, requestGranularity);
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
                const { jobId } = req.params;
                const response = await this.exportHandler.getExportJobStatus(jobId);
                res.send(response);
            }),
        );

        // Cancel export job
        this.router.delete(
            '/\\$export/:jobId',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const { jobId } = req.params;
                await this.exportHandler.cancelExport(jobId);
                res.status(202).send();
            }),
        );
    }
}
