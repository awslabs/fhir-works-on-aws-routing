/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { FhirConfig, UnauthorizedError } from 'fhir-works-on-aws-interface';
import express from 'express';
import { get } from 'lodash';
import RouteHelper from '../routes/routeHelper';

const tenantIdRegex = /^[a-zA-Z0-9\-_]{1,64}$/;

/**
 * Sets the value of `res.locals.tenantId`
 * tenantId is used to identify tenants in a multi-tenant setup
 */
export const setTenantIdMiddleware: (
    fhirConfig: FhirConfig,
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (fhirConfig: FhirConfig) => {
    return RouteHelper.wrapAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const tenantId = get(res.locals.userIdentity, fhirConfig.multiTenancyConfig?.tenantIdClaimPath!);
        if (
            tenantId === undefined ||
            !tenantIdRegex.test(tenantId) ||
            (req.params.tenantIdFromPath !== undefined && req.params.tenantIdFromPath !== tenantId)
        ) {
            throw new UnauthorizedError('Unauthorized');
        }
        res.locals.tenantId = tenantId;
        next();
    });
};
