/* eslint-disable no-underscore-dangle */
import express from 'express';
import { ExportType, InitiateExportRequest } from 'fhir-works-on-aws-interface';
import createHttpError from 'http-errors';
import isString from 'lodash/isString';

export default class ExportRouteHelper {
    static buildInitiateExportRequest(req: express.Request, res: express.Response, exportType: ExportType) {
        if (req.query._outputFormat && req.query._outputFormat !== 'ndjson') {
            throw new createHttpError.BadRequest('We only support exporting resources into ndjson formatted file');
        }
        const { requesterUserId } = res.locals;

        const initiateExportRequest: InitiateExportRequest = {
            requesterUserId,
            exportType,
            transactionTime: Math.floor(Date.now() / 1000),
            outputFormat: isString(req.query._outputFormat) ? req.query._outputFormat : undefined,
            since: Number(req.query._since) ? Number(req.query._since) : undefined,
            type: isString(req.query._type) ? req.query._type : undefined,
            groupId: isString(req.params.id) ? req.params.id : undefined,
        };
        return initiateExportRequest;
    }
}
