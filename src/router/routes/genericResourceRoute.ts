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
                    let response = await this.handler.read(resourceType, id);
                    response = this.authService.authorizeAndFilterReadResponse({
                        operation: 'read',
                        accessToken: req.headers.authorization ?? '',
                        readResponse: response,
                    });
                    if (response.meta) {
                        res.set({ ETag: `W/"${response.meta.versionId}"`, 'Last-Modified': response.meta.lastUpdated });
                    }
                    res.send(response);
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
                    let response = await this.handler.vRead(resourceType, id, vid);
                    response = this.authService.authorizeAndFilterReadResponse({
                        operation: 'vread',
                        accessToken: req.headers.authorization ?? '',
                        readResponse: response,
                    });
                    if (response.meta) {
                        res.set({ ETag: `W/"${response.meta.versionId}"`, 'Last-Modified': response.meta.lastUpdated });
                    }
                    res.send(response);
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
                    let response = await this.handler.typeHistory(resourceType, searchParamQuery);
                    response = this.authService.authorizeAndFilterReadResponse({
                        operation: 'history-type',
                        accessToken: req.headers.authorization ?? '',
                        readResponse: response,
                    });
                    res.send(response);
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
                    let response = await this.handler.instanceHistory(resourceType, id, searchParamQuery);
                    response = this.authService.authorizeAndFilterReadResponse({
                        operation: 'history-instance',
                        accessToken: req.headers.authorization ?? '',
                        readResponse: response,
                    });
                    res.send(response);
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
                        accessToken: req.headers.authorization ?? '',
                    });

                    let response = await this.handler.typeSearch(resourceType, searchParamQuery, allowedResourceTypes);
                    response = this.authService.authorizeAndFilterReadResponse({
                        operation: 'search-type',
                        accessToken: req.headers.authorization ?? '',
                        readResponse: response,
                    });
                    res.send(response);
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

                    this.authService.isWriteRequestAuthorized({
                        resourceBody: body,
                        operation: 'create',
                        accessToken: req.headers.authorization ?? '',
                    });

                    const response = await this.handler.create(resourceType, body);
                    if (response.meta) {
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
                    this.authService.isWriteRequestAuthorized({
                        resourceBody: body,
                        operation: 'update',
                        accessToken: req.headers.authorization ?? '',
                    });

                    const response = await this.handler.update(resourceType, id, body);
                    if (response.meta) {
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
                    this.authService.isWriteRequestAuthorized({
                        resourceBody: body,
                        operation: 'patch',
                        accessToken: req.headers.authorization ?? '',
                    });

                    const response = await this.handler.patch(resourceType, id, body);
                    if (response.meta) {
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

                    this.authService.isWriteRequestAuthorized({
                        resourceBody: readResponse,
                        operation: 'delete',
                        accessToken: req.headers.authorization ?? '',
                    });
                    const response = await this.handler.delete(resourceType, id);
                    res.send(response);
                }),
            );
        }
    }
}
