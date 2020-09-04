/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-underscore-dangle */
import express, { Router } from 'express';
import { ExportRequestGranularity, Persistence } from 'fhir-works-on-aws-interface';
import { BadRequestError } from 'fhir-works-on-aws-interface/lib/errors/BadRequestsError';
import isString from 'lodash/isString';
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

    async initiateExportRequests(
        req: express.Request,
        res: express.Response,
        requestGranularity: ExportRequestGranularity,
    ) {
        const requestQueryParams: any = {};
        // eslint-disable-next-line no-unused-expressions
        isString(req.query._outputFormat) ? (requestQueryParams._outputFormat = req.query._outputFormat) : '';
        // eslint-disable-next-line no-unused-expressions
        Number(req.query._since) ? (requestQueryParams._since = Number(req.query._since)) : '';
        // eslint-disable-next-line no-unused-expressions
        isString(req.query._type) ? (requestQueryParams._type = req.query._type) : '';

        if (requestQueryParams._outputFormat && requestQueryParams._outputFormat !== 'ndjson') {
            throw new BadRequestError('We only support exporting resources into ndjson formatted file');
        }
        const { requesterUserId } = res.locals;
        const groupId = req.params.id;
        const jobId = await this.exportHandler.initiateExportRequest(
            requesterUserId,
            requestGranularity,
            requestQueryParams,
            groupId,
        );

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
                const requestGranularity: ExportRequestGranularity = 'system';
                await this.initiateExportRequests(req, res, requestGranularity);
            }),
        );

        this.router.get('/Patient/\\$export', () => {
            throw new BadRequestError('We currently do not support Patient export');
        });

        this.router.get('/Group/:id/\\$export', () => {
            throw new BadRequestError('We currently do not support Group export');
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
