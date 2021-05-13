/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import express from 'express';
import { KeyValueMap, TypeOperation } from 'fhir-works-on-aws-interface';
import { OperationDefinitionImplementation } from '../types';
import ResourceHandler from '../../router/handlers/resourceHandler';
import RouteHelper from '../../router/routes/routeHelper';
import { DocRefParams, parsePostParams, parseQueryParams } from './parseParams';
import { convertDocRefParamsToSearchParams } from './convertDocRefParamsToSearchParams';

const searchTypeOperation: TypeOperation = 'search-type';

const docRefImpl = async (resourceHandler: ResourceHandler, userIdentity: KeyValueMap, params: DocRefParams) => {
    const searchParams = convertDocRefParamsToSearchParams(params);
    return resourceHandler.typeSearch('DocumentReference', searchParams, userIdentity);
};

export const USCoreDocRef: OperationDefinitionImplementation = {
    canonicalUrl: 'http://hl7.org/fhir/us/core/OperationDefinition/docref',
    path: '/DocumentReference/$docref',
    httpMethods: ['GET', 'POST'],
    targetResourceType: 'DocumentReference',
    requestInformation: {
        operation: searchTypeOperation,
        resourceType: 'DocumentReference',
    },
    buildRouter: (resourceHandler: ResourceHandler) => {
        const path = '/DocumentReference/\\$docref';
        const router = express.Router();
        router.get(
            path,
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const response = await docRefImpl(
                    resourceHandler,
                    res.locals.userIdentity,
                    parseQueryParams(req.query),
                );
                res.send(response);
            }),
        );

        router.post(
            path,
            RouteHelper.wrapAsync(async (req: express.Request, res: express.Response) => {
                const response = await docRefImpl(resourceHandler, res.locals.userIdentity, parsePostParams(req.body));
                res.send(response);
            }),
        );

        return router;
    },
};
