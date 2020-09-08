import express from 'express';
import createError from 'http-errors';
import { InvalidResourceError, ResourceNotFoundError, ResourceVersionNotFoundError } from 'fhir-works-on-aws-interface';
import { TooManyRequestsError } from 'fhir-works-on-aws-interface/lib/errors/TooManyRequestsError';
import { BadRequestError } from 'fhir-works-on-aws-interface/lib/errors/BadRequestsError';
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
    if (err instanceof BadRequestError) {
        next(new createError.BadRequest(err.message));
        return;
    }
    if (err instanceof TooManyRequestsError) {
        next(
            new createError.TooManyRequests(
                'There is currently too many concurrent export requests. Please try again later',
            ),
        );
        return;
    }
    next(err);
};

export const httpErrorHandler = (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
    retryAgainInSeconds: number,
) => {
    if (err instanceof createError.TooManyRequests) {
        res.header('Retry-After', retryAgainInSeconds.toString(10));
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
