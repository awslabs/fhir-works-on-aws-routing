/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-underscore-dangle */
import express, { Router } from 'express';
import { ExportRequestGranularity, Persistence } from 'fhir-works-on-aws-interface';
import RouteHelper from './routeHelper';
import ExportHandler from '../handlers/exportHandler';

export default class ExportRoute {
    readonly router: Router;

    private exportHandler: any;

    constructor(persistence: Persistence) {
        this.router = express.Router();
        // @ts-ignore
        this.exportHandler = new ExportHandler(persistence);
        this.init();
    }

    async initiateExportRequests(
        req: express.Request,
        res: express.Response,
        requestGranularity: ExportRequestGranularity,
    ) {
        const requestQueryParams = {
            _outputFormat: req.query._outputFormat,
            _since: Number(req.query._since),
            _type: req.query._type,
        };
        const { requesterUserId } = res.locals;
        const groupId = req.params.id;
        const response = await this.exportHandler.initiateExportRequest(
            requesterUserId,
            requestGranularity,
            requestQueryParams,
            groupId,
        );
        res.send(response);
    }

    init() {
        this.router.get(
            '/\\$export',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const requestGranularity: ExportRequestGranularity = 'system';
                await this.initiateExportRequests(req, res, requestGranularity);
            }),
        );
        this.router.get(
            '/Patient/\\$export',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const requestGranularity: ExportRequestGranularity = 'patient';
                await this.initiateExportRequests(req, res, requestGranularity);
            }),
        );
        this.router.get(
            '/Group/:id/\\$export',
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const requestGranularity: ExportRequestGranularity = 'group';
                await this.initiateExportRequests(req, res, requestGranularity);
            }),
        );

        // TODO: Add routes for Export Status Request link
        // TODO: Add routes for Delete Request link
    }
}
