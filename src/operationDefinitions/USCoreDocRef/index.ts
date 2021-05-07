/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import express, { Router } from 'express';
import { KeyValueMap, TypeOperation } from 'fhir-works-on-aws-interface';
import { OperationDefinitionImplementation } from '../types';
import ResourceHandler from '../../router/handlers/resourceHandler';
import RouteHelper from '../../router/routes/routeHelper';
import { DocRefParams, parsePostParams, parseQueryParams } from './parseParams';
import { docRefParamsToSearchParams } from './docRefParamsToSearchParams';

const searchTypeOperation: TypeOperation = 'search-type';

const docRefImpl = async (resourceHandler: ResourceHandler, userIdentity: KeyValueMap, params: DocRefParams) => {
    const searchParams = docRefParamsToSearchParams(params);
    return resourceHandler.typeSearch('DocumentReference', searchParams, userIdentity);
};

export class USCoreDocRef implements OperationDefinitionImplementation {
    readonly canonicalUrl = 'http://hl7.org/fhir/us/core/OperationDefinition/docref';

    readonly requestInformation = {
        operation: searchTypeOperation,
        resourceType: 'DocumentReference',
    };

    private readonly resourceHandler: ResourceHandler;

    readonly router: Router;

    constructor(resourceHandler: ResourceHandler) {
        this.resourceHandler = resourceHandler;
        const path = '/DocumentReference/\\$docref';
        const router = express.Router();
        router.get(
            path,
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const response = await docRefImpl(
                    this.resourceHandler,
                    res.locals.userIdentity,
                    parseQueryParams(req.query),
                );
                res.send(response);
            }),
        );

        router.post(
            path,
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const response = await docRefImpl(
                    this.resourceHandler,
                    res.locals.userIdentity,
                    parsePostParams(req.body),
                );
                res.send(response);
            }),
        );
        this.router = router;
    }
}
