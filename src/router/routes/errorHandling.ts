import express from 'express';
import createError from 'http-errors';
import { InvalidResourceError, ResourceNotFoundError, ResourceVersionNotFoundError } from 'fhir-works-on-aws-interface';
import { TooManyConcurrentExportRequestsError } from 'fhir-works-on-aws-interface/lib/errors/TooManyConcurrentExportRequestsError';
import { UnauthorizedAccessError } from 'fhir-works-on-aws-interface/lib/errors/UnauthorizedAccessError';
import OperationsGenerator from '../operationsGenerator';

export const applicationErrorMapper = (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    console.error(err);
    if (err instanceof ResourceNotFoundError) {
        next(new createError.NotFound(err.message));
        return;
    }
    if (err instanceof ResourceVersionNotFoundError) {
        next(new createError.NotFound(err.message));
        return;
    }
    if (err instanceof InvalidResourceError) {
        next(new createError.BadRequest(`Failed to parse request body as JSON resource. Error was: ${err.message}`));
        return;
    }
    if (err instanceof TooManyConcurrentExportRequestsError) {
        next(new createError.TooManyRequests('There is currently too many requests. Please try again later'));
        return;
    }
    if (err instanceof UnauthorizedAccessError) {
        next(new createError.Forbidden('Forbidden'));
        return;
    }
    next(err);
};

export const httpErrorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof createError.TooManyRequests) {
        const RETRY_AGAIN_IN_SECONDS = 15 * 60; // 15 Minutes
        res.header('Retry-After', RETRY_AGAIN_IN_SECONDS.toString(10));
    }
    if (createError.isHttpError(err)) {
        console.error('HttpError', err);
        res.status(err.statusCode).send(OperationsGenerator.generateError(err.message));
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
    res.status(500).send(OperationsGenerator.generateError('Internal server error'));
};
