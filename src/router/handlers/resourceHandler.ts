/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Search } from '@awslabs/aws-fhir-interface';
import { History } from '@awslabs/aws-fhir-interface';
import { Persistence } from '@awslabs/aws-fhir-interface';
import NotFoundError from '@awslabs/aws-fhir-interface';
import BadRequestError from '@awslabs/aws-fhir-interface';
import InternalServerError from '@awslabs/aws-fhir-interface';
import { FhirVersion } from '@awslabs/aws-fhir-interface';
import BundleGenerator from '../bundle/bundleGenerator';
import CrudHandlerInterface from './CrudHandlerInterface';
import OperationsGenerator from '../operationsGenerator';
import Validator from '../validation/validator';

export default class ResourceHandler implements CrudHandlerInterface {
    private validator: Validator;

    private dataService: Persistence;

    private searchService: Search;

    private historyService: History;

    private serverUrl: string;

    constructor(
        dataService: Persistence,
        searchService: Search,
        historyService: History,
        fhirVersion: FhirVersion,
        serverUrl: string,
    ) {
        this.validator = new Validator(fhirVersion);
        this.dataService = dataService;
        this.searchService = searchService;
        this.historyService = historyService;
        this.serverUrl = serverUrl;
    }

    async create(resourceType: string, resource: any) {
        const validationResponse = this.validator.validate(resourceType, resource);
        if (!validationResponse.success) {
            const invalidInput = OperationsGenerator.generatInputValidationError(validationResponse.message);
            throw new BadRequestError(invalidInput);
        }

        const createResponse = await this.dataService.createResource({ resourceType, resource });
        if (!createResponse.success) {
            const serverError = OperationsGenerator.generateError(createResponse.message);
            throw new InternalServerError(serverError);
        }

        return createResponse.resource;
    }

    async update(resourceType: string, id: string, resource: any) {
        const validationResponse = this.validator.validate(resourceType, resource);
        if (!validationResponse.success) {
            const invalidInput = OperationsGenerator.generatInputValidationError(validationResponse.message);
            throw new BadRequestError(invalidInput);
        }

        const updateResponse = await this.dataService.updateResource({ resourceType, id, resource });
        if (!updateResponse.success) {
            const serverError = OperationsGenerator.generateError(updateResponse.message);
            throw new InternalServerError(serverError);
        }

        return updateResponse.resource;
    }

    async patch(resourceType: string, id: string, resource: any) {
        // TODO Add request validation around patching
        const patchResponse = await this.dataService.patchResource({ resourceType, id, resource });
        if (!patchResponse.success) {
            const serverError = OperationsGenerator.generateError(patchResponse.message);
            throw new InternalServerError(serverError);
        }

        return patchResponse.resource;
    }

    async typeSearch(resourceType: string, queryParams: any) {
        const searchResponse = await this.searchService.typeSearch({
            resourceType,
            queryParams,
            baseUrl: this.serverUrl,
        });
        if (!searchResponse.success) {
            const errorMessage = searchResponse.result.message;
            const processingError = OperationsGenerator.generateProcessingError(errorMessage, errorMessage);
            throw new InternalServerError(processingError);
        }
        return BundleGenerator.generateBundle(
            this.serverUrl,
            queryParams,
            searchResponse.result,
            'searchset',
            resourceType,
        );
    }

    async typeHistory(resourceType: string, queryParams: any) {
        const historyResponse = await this.historyService.typeHistory({
            resourceType,
            queryParams,
            baseUrl: this.serverUrl,
        });
        if (!historyResponse.success) {
            const errorMessage = historyResponse.result.message;
            const processingError = OperationsGenerator.generateProcessingError(errorMessage, errorMessage);
            throw new InternalServerError(processingError);
        }
        return BundleGenerator.generateBundle(
            this.serverUrl,
            queryParams,
            historyResponse.result,
            'history',
            resourceType,
        );
    }

    async instanceHistory(resourceType: string, id: string, queryParams: any) {
        const historyResponse = await this.historyService.instanceHistory({
            id,
            resourceType,
            queryParams,
            baseUrl: this.serverUrl,
        });
        if (!historyResponse.success) {
            const errorMessage = historyResponse.result.message;
            const processingError = OperationsGenerator.generateProcessingError(errorMessage, errorMessage);
            throw new InternalServerError(processingError);
        }
        return BundleGenerator.generateBundle(
            this.serverUrl,
            queryParams,
            historyResponse.result,
            'history',
            resourceType,
            id,
        );
    }

    async read(resourceType: string, id: string) {
        const getResponse = await this.dataService.readResource({ resourceType, id });
        if (!getResponse.success) {
            const errorDetail = OperationsGenerator.generateResourceNotFoundError(resourceType, id);
            throw new NotFoundError(errorDetail);
        }

        return getResponse.resource;
    }

    async vRead(resourceType: string, id: string, vid: string) {
        const getResponse = await this.dataService.vReadResource({ resourceType, id, vid });
        if (!getResponse.success) {
            const errorDetail = OperationsGenerator.generateHistoricResourceNotFoundError(resourceType, id, vid);
            throw new NotFoundError(errorDetail);
        }

        return getResponse.resource;
    }

    async delete(resourceType: string, id: string) {
        const deleteResponse = await this.dataService.deleteResource({ resourceType, id });
        if (!deleteResponse.success) {
            const resourceNotFound = OperationsGenerator.generateResourceNotFoundError(resourceType, id);
            throw new NotFoundError(resourceNotFound);
        }

        return OperationsGenerator.generateSuccessfulDeleteOperation();
    }
}
