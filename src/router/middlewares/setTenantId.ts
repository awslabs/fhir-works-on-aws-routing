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

const getTenantIdFromAudClaim = (audClaim: string) => {
    // aud claim should ALWAYS be present regardless of tenancy mode
    if (!audClaim) {
        throw new UnauthorizedError('Unauthorized');
    }
    const audClaimSplit = audClaim.split('://')[1].split('/');
    if (audClaimSplit.length === 2) {
        return undefined;
    }
    return audClaimSplit.pop();
};

/**
 * Sets the value of `res.locals.tenantId`
 * tenantId is used to identify tenants in a multi-tenant setup
 */
export const setTenantIdMiddleware: (
    fhirConfig: FhirConfig,
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (fhirConfig: FhirConfig) => {
    return RouteHelper.wrapAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        // Find tenantId from custom claim and aud claim
        const tenantIdFromCustomClaim = get(res.locals.userIdentity, fhirConfig.multiTenancyConfig?.tenantIdClaimPath!);
        const tenantIdFromAudClaim = getTenantIdFromAudClaim(res.locals.userIdentity.aud);

        // TenantId should exist in at least one claim, if exist in both claims, they should be equal
        if (
            (tenantIdFromCustomClaim === undefined && tenantIdFromAudClaim === undefined) ||
            (tenantIdFromCustomClaim && tenantIdFromAudClaim && tenantIdFromCustomClaim !== tenantIdFromAudClaim)
        ) {
            throw new UnauthorizedError('Unauthorized');
        }
        const tenantId = tenantIdFromCustomClaim || tenantIdFromAudClaim;

        if (
            !tenantIdRegex.test(tenantId) ||
            (req.params.tenantIdFromPath !== undefined && req.params.tenantIdFromPath !== tenantId)
        ) {
            throw new UnauthorizedError('Unauthorized');
        }
        res.locals.tenantId = tenantId;
        next();
    });
};
