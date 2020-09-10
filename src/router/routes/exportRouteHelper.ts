/* eslint-disable no-underscore-dangle */
import express from 'express';
import { ExportType, InitiateExportRequest } from 'fhir-works-on-aws-interface';
import createHttpError from 'http-errors';
import isString from 'lodash/isString';
import { utcTimeRegExp } from '../../regExpressions';

export default class ExportRouteHelper {
    static buildInitiateExportRequest(req: express.Request, res: express.Response, exportType: ExportType) {
        if (req.query._outputFormat && req.query._outputFormat !== 'ndjson') {
            throw new createHttpError.BadRequest('We only support exporting resources into ndjson formatted file');
        }
        if (
            (req.query._since && !isString(req.query._since)) ||
            (req.query._since && isString(req.query._since) && !utcTimeRegExp.test(req.query._since))
        ) {
            throw new createHttpError.BadRequest(
                "Query '_since' should be in the FHIR Instant format: YYYY-MM-DDThh:mm:ssZ. Exp. 2020-09-01T00:00:00Z",
            );
        }
        const { requesterUserId } = res.locals;

        const initiateExportRequest: InitiateExportRequest = {
            requesterUserId,
            exportType,
            transactionTime: new Date().toISOString(),
            outputFormat: isString(req.query._outputFormat) ? req.query._outputFormat : undefined,
            since: isString(req.query._since) && utcTimeRegExp.test(req.query._since) ? req.query._since : undefined,
            type: isString(req.query._type) ? req.query._type : undefined,
            groupId: isString(req.params.id) ? req.params.id : undefined,
        };
        return initiateExportRequest;
    }
}
