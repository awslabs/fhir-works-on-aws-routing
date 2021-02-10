/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Router } from 'express';
import { Authorization, TypeOperation } from 'fhir-works-on-aws-interface';
import createError from 'http-errors';
import CrudHandlerInterface from '../handlers/CrudHandlerInterface';
import RouteHelper from './routeHelper';

export default class GenericResourceRoute {
    readonly operations: TypeOperation[];

    readonly router: Router;

    private handler: CrudHandlerInterface;

    private readonly authService: Authorization;

    constructor(operations: TypeOperation[], handler: CrudHandlerInterface, authService: Authorization) {
        this.operations = operations;
        this.handler = handler;
        this.router = express.Router();
        this.authService = authService;
        this.init();
    }

    private init() {
        // TODO handle HTTP response code
        if (this.operations.includes('read')) {
            // READ
            this.router.get(
                '/:id',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const { id } = req.params;
                    const response = await this.handler.read(resourceType, id);
                    const updatedReadResponse = await this.authService.authorizeAndFilterReadResponse({
                        operation: 'read',
                        userIdentity: res.locals.userIdentity,
                        readResponse: response,
                    });
                    if (updatedReadResponse && updatedReadResponse.meta) {
                        res.set({
                            ETag: `W/"${updatedReadResponse.meta.versionId}"`,
                            'Last-Modified': updatedReadResponse.meta.lastUpdated,
                        });
                    }
                    res.send(updatedReadResponse);
                }),
            );
        }

        // VREAD
        if (this.operations.includes('vread')) {
            this.router.get(
                '/:id/_history/:vid',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const { id, vid } = req.params;
                    const response = await this.handler.vRead(resourceType, id, vid);
                    const updatedReadResponse = await this.authService.authorizeAndFilterReadResponse({
                        operation: 'vread',
                        userIdentity: res.locals.userIdentity,
                        readResponse: response,
                    });
                    if (updatedReadResponse && updatedReadResponse.meta) {
                        res.set({
                            ETag: `W/"${updatedReadResponse.meta.versionId}"`,
                            'Last-Modified': updatedReadResponse.meta.lastUpdated,
                        });
                    }
                    res.send(updatedReadResponse);
                }),
            );
        }

        // Type History
        if (this.operations.includes('history-type')) {
            this.router.get(
                '/_history',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const searchParamQuery = req.query;
                    const response = await this.handler.typeHistory(
                        resourceType,
                        searchParamQuery,
                        res.locals.userIdentity,
                    );
                    const updatedReadResponse = await this.authService.authorizeAndFilterReadResponse({
                        operation: 'history-type',
                        userIdentity: res.locals.userIdentity,
                        readResponse: response,
                    });
                    res.send(updatedReadResponse);
                }),
            );
        }

        // Instance History
        if (this.operations.includes('history-instance')) {
            this.router.get(
                '/:id/_history',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const searchParamQuery = req.query;
                    const { id } = req.params;
                    const response = await this.handler.instanceHistory(
                        resourceType,
                        id,
                        searchParamQuery,
                        res.locals.userIdentity,
                    );
                    const updatedReadResponse = await this.authService.authorizeAndFilterReadResponse({
                        operation: 'history-instance',
                        userIdentity: res.locals.userIdentity,
                        readResponse: response,
                    });
                    res.send(updatedReadResponse);
                }),
            );
        }

        if (this.operations.includes('search-type')) {
            // SEARCH
            this.router.get(
                '/',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const searchParamQuery = req.query;

                    const allowedResourceTypes = await this.authService.getAllowedResourceTypesForOperation({
                        operation: 'search-type',
                        userIdentity: res.locals.userIdentity,
                    });

                    const response = await this.handler.typeSearch(
                        resourceType,
                        searchParamQuery,
                        allowedResourceTypes,
                        res.locals.userIdentity,
                    );
                    const updatedReadResponse = await this.authService.authorizeAndFilterReadResponse({
                        operation: 'search-type',
                        userIdentity: res.locals.userIdentity,
                        readResponse: response,
                    });
                    res.send(updatedReadResponse);
                }),
            );
        }

        // CREATE
        if (this.operations.includes('create')) {
            this.router.post(
                '/',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const { body } = req;

                    await this.authService.isWriteRequestAuthorized({
                        resourceBody: body,
                        operation: 'create',
                        userIdentity: res.locals.userIdentity,
                    });

                    const response = await this.handler.create(resourceType, body);
                    if (response && response.meta) {
                        res.set({ ETag: `W/"${response.meta.versionId}"`, 'Last-Modified': response.meta.lastUpdated });
                    }
                    res.status(201).send(response);
                }),
            );
        }

        // UPDATE
        if (this.operations.includes('update')) {
            this.router.put(
                '/:id',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    const resourceType = req.baseUrl.substr(1);
                    const { id } = req.params;
                    const { body } = req;

                    if (body.id === null || body.id !== id) {
                        throw new createError.BadRequest(
                            `Can not update resource with ID[${id}], while the given request payload has an ID[${body.id}]`,
                        );
                    }
                    await this.authService.isWriteRequestAuthorized({
                        resourceBody: body,
                        operation: 'update',
                        userIdentity: res.locals.userIdentity,
                    });

                    const response = await this.handler.update(resourceType, id, body);
                    if (response && response.meta) {
                        res.set({ ETag: `W/"${response.meta.versionId}"`, 'Last-Modified': response.meta.lastUpdated });
                    }
                    res.send(response);
                }),
            );
        }

        // PATCH
        if (this.operations.includes('patch')) {
            this.router.patch(
                '/:id',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    const resourceType = req.baseUrl.substr(1);
                    const { id } = req.params;
                    const { body } = req;

                    if (body.id === null || body.id !== id) {
                        throw new createError.BadRequest(
                            `Can not update resource with ID[${id}], while the given request payload has an ID[${body.id}]`,
                        );
                    }
                    await this.authService.isWriteRequestAuthorized({
                        resourceBody: body,
                        operation: 'patch',
                        userIdentity: res.locals.userIdentity,
                    });

                    const response = await this.handler.patch(resourceType, id, body);
                    if (response && response.meta) {
                        res.set({ ETag: `W/"${response.meta.versionId}"`, 'Last-Modified': response.meta.lastUpdated });
                    }
                    res.send(response);
                }),
            );
        }

        // DELETE
        if (this.operations.includes('delete')) {
            this.router.delete(
                '/:id',
                RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                    // Get the ResourceType looks like '/Patient'
                    const resourceType = req.baseUrl.substr(1);
                    const { id } = req.params;
                    const readResponse = await this.handler.read(resourceType, id);

                    await this.authService.isWriteRequestAuthorized({
                        resourceBody: readResponse,
                        operation: 'delete',
                        userIdentity: res.locals.userIdentity,
                    });

                    const response = await this.handler.delete(resourceType, id);
                    res.send(response);
                }),
            );
        }
    }
}
