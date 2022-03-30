/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { FhirConfig, UnauthorizedError } from 'fhir-works-on-aws-interface';
import express from 'express';
import { get, uniq } from 'lodash';
import RouteHelper from '../routes/routeHelper';

const tenantIdRegex = /^[a-zA-Z0-9\-_]{1,64}$/;

/**
 * Filters out a non matching tenant id value by using regular repressions and an optional tenant id url param value.
 *
 * @param tenantIdCandidate The tenant id value candidate
 * @param tenantIdFromPath The optional tenant id url parameter used for filtering
 * @returns The tenant id on successfull match, otherwise return undefined
 */
function filterTenantId(
    tenantIdCandidate: string | undefined,
    tenantIdFromPath: string | undefined,
): string | undefined {
    if (
        tenantIdCandidate &&
        tenantIdRegex.test(tenantIdCandidate) &&
        (!tenantIdFromPath || tenantIdFromPath === tenantIdCandidate)
    ) {
        return tenantIdCandidate;
    }
    return undefined;
}

const getTenantIdFromAudString = (audClaim: string, baseUrl: string): string | undefined => {
    if (audClaim.startsWith(`${baseUrl}/tenant/`)) {
        return audClaim.substring(`${baseUrl}/tenant/`.length);
    }
    return undefined;
};

const getTenantIdFromAudClaim = (audClaim: any, baseUrl: string): string | undefined => {
    if (!audClaim) {
        return undefined;
    }
    let audClaimAsArray: string[] = [];

    if (typeof audClaim === 'string') {
        audClaimAsArray = [audClaim];
    }

    if (Array.isArray(audClaim)) {
        audClaimAsArray = audClaim;
    }

    const tenantIds = audClaimAsArray
        .map((aud: string) => getTenantIdFromAudString(aud, baseUrl))
        .filter((aud: any) => aud !== undefined);

    const uniqTenantIds = uniq(tenantIds);

    if (uniqTenantIds.length > 1) {
        // tokens with multiple aud URLs with different tenantIds are not supported
        return undefined;
    }
    if (uniqTenantIds.length === 0) {
        return undefined;
    }
    return uniqTenantIds[0];
};

/**
 * Evaluates if an all tenants scope matches with the configured one.
 * @param userIdentity The decoded access token data.
 * @param fhirConfig The config, which includes multi-tenant setup.
 * @returns true access granted, false denied
 */
function evaluateAccessForAllTenants(userIdentity: any, fhirConfig: FhirConfig): boolean {
    return (
        fhirConfig.multiTenancyConfig?.grantAccessAllTenantsScope &&
        userIdentity.scope?.includes(fhirConfig.multiTenancyConfig?.grantAccessAllTenantsScope)
    );
}

const getTenantIdFromCustomClaimValue = (tenantIdClaimValue: string, prefix?: string): string | undefined => {
    if (!prefix) {
        return tenantIdClaimValue;
    }

    if (tenantIdClaimValue.startsWith(prefix)) {
        return tenantIdClaimValue.substring(prefix.length);
    }
    return undefined;
};

/**
 * Evaluates if tenant id url param value is included in custom claim, or not.
 * @param tenantIdFromCustomClaim Possible tenant id values from custom claim
 * @param prefix The optional prefix for tenantIdClaimValue
 * @param tenantIdFromPath The tenant id url parameter to test
 * @returns The tenant id if it was found in custom claim, otherwise return undefined
 */
function getTenantIdFromCustomClaim(
    tenantIdFromCustomClaim: any,
    prefix: string | undefined,
    tenantIdFromPath: string | undefined,
): string | undefined {
    let tenantIdFromCustomClaimAsArray: (string | undefined)[] = [];
    if (tenantIdFromCustomClaim && Array.isArray(tenantIdFromCustomClaim)) {
        tenantIdFromCustomClaimAsArray = tenantIdFromCustomClaim
            .map((tenantIdClaimValue: string) => getTenantIdFromCustomClaimValue(tenantIdClaimValue, prefix))
            .filter((tenantIdCandidate: any) => tenantIdCandidate);
    }

    if (typeof tenantIdFromCustomClaim === 'string') {
        tenantIdFromCustomClaimAsArray = [tenantIdFromCustomClaim];
    }

    // Multiple possible tenant id values in custom claim is only supported, if a tenantId from url path is available
    if (tenantIdFromCustomClaimAsArray.length > 1 && tenantIdFromPath) {
        if (tenantIdRegex.test(tenantIdFromPath) && tenantIdFromCustomClaimAsArray.includes(tenantIdFromPath)) {
            return tenantIdFromPath;
        }
    }

    if (tenantIdFromCustomClaimAsArray.length === 1) {
        const tenantIdCandidate: string = tenantIdFromCustomClaimAsArray[0]!;
        return filterTenantId(tenantIdCandidate, tenantIdFromPath);
    }
    return undefined;
}

/**
 * Sets the value of `res.locals.tenantId`
 * tenantId is used to identify tenants in a multi-tenant setup
 */
export const setTenantIdMiddleware: (
    fhirConfig: FhirConfig,
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (fhirConfig: FhirConfig) => {
    return RouteHelper.wrapAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.params.tenantIdFromPath) {
            // The default tenant is always allowed to be accessed
            // It shall contain resources, which are shared by multiple tenants, e.g. CodingSystems, Questionnaires etc.

            // Also check for an "all tenants" scope, this is relevant for machine to machine access tokens issued via client credential flow (Oauthv2)
            if (
                req.params.tenantIdFromPath === 'DEFAULT' ||
                evaluateAccessForAllTenants(res.locals.userIdentity, fhirConfig)
            ) {
                res.locals.tenantId = req.params.tenantIdFromPath;
                next();
                return;
            }
        }

        // Find tenantId from custom claim
        const tenantIdFromCustomClaim = get(res.locals.userIdentity, fhirConfig.multiTenancyConfig?.tenantIdClaimPath!);

        // Find tenantId from aud claim
        const tenantIdFromAudClaim = getTenantIdFromAudClaim(res.locals.userIdentity.aud, fhirConfig.server.url);

        // TenantId should exist in at least one claim, if exist in both claims, they should be equal
        if (
            (tenantIdFromCustomClaim === undefined && tenantIdFromAudClaim === undefined) ||
            (tenantIdFromCustomClaim && tenantIdFromAudClaim && tenantIdFromCustomClaim !== tenantIdFromAudClaim)
        ) {
            throw new UnauthorizedError('Unauthorized');
        }
        // Check whether to grant access based on given custom claim or aud claim values
        const tenantId =
            getTenantIdFromCustomClaim(
                tenantIdFromCustomClaim,
                fhirConfig.multiTenancyConfig?.tenantIdClaimValuePrefix,
                req.params.tenantIdFromPath,
            ) || filterTenantId(tenantIdFromAudClaim, req.params.tenantIdFromPath);

        if (!tenantId) {
            throw new UnauthorizedError('Unauthorized');
        }
        res.locals.tenantId = tenantId;
        next();
    });
};
