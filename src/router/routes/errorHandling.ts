import express from 'express';
import createError from 'http-errors';
import {
    isInvalidResourceError,
    isResourceNotFoundError,
    isResourceVersionNotFoundError,
    isUnauthorizedError,
    IssueSeverity,
    IssueCode,
} from 'fhir-works-on-aws-interface';
import OperationsGenerator from '../operationsGenerator';

export const applicationErrorMapper = (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    console.error(err);
    if (isResourceNotFoundError(err)) {
        next(new createError.NotFound(err.message));
        return;
    }
    if (isResourceVersionNotFoundError(err)) {
        next(new createError.NotFound(err.message));
        return;
    }
    if (isInvalidResourceError(err)) {
        next(new createError.BadRequest(`Failed to parse request body as JSON resource. Error was: ${err.message}`));
        return;
    }
    if (isUnauthorizedError(err)) {
        next(new createError.Forbidden(err.message));
        return;
    }
    next(err);
};

const statusToOutcome: Record<number, { severity: IssueSeverity; code: IssueCode }> = {
    400: { severity: 'error', code: 'invalid' },
    403: { severity: 'error', code: 'security' },
    404: { severity: 'error', code: 'not-found' },
    500: { severity: 'error', code: 'exception' },
};

export const httpErrorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (createError.isHttpError(err)) {
        console.error('HttpError', err);
        const { severity, code } = statusToOutcome[err.statusCode];
        res.status(err.statusCode).send(OperationsGenerator.generateOperationOutcomeIssue(severity, code, err.message));
        return;
    }
    next(err);
};

export const unknownErrorHandler = (
    err: any,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: express.NextFunction,
) => {
    console.error('Unhandled Error', err);
    const msg = 'Internal server error';
    res.status(500).send(OperationsGenerator.generateOperationOutcomeIssue('error', 'exception', msg));
};
