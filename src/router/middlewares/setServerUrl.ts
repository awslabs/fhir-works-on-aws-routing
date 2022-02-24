/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { FhirConfig } from 'fhir-works-on-aws-interface';
import express from 'express';
import RouteHelper from '../routes/routeHelper';

/**
 * Sets the value of `res.locals.serverUrl`
 * the serverUrl can either be a static value from FhirConfig of a dynamic value for some multi-tenancy setups.
 */
export const setServerUrlMiddleware: (
    fhirConfig: FhirConfig,
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (fhirConfig: FhirConfig) => {
    return RouteHelper.wrapAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let serverUrl = fhirConfig.server.url;
        if (fhirConfig.server.dynamicHostName && req.headers.host !== undefined) {
            // use the request's hostname instead of the configured url
            // this is useful when requests can come from multiple TLDs
            // examples: private API gateway, custom DNS values, CNAMES
            const parsedUrl = new URL(serverUrl);
            parsedUrl.hostname = req.headers.host;

            // downstream code expects no trailing `/` char
            serverUrl = parsedUrl.href;
            if (serverUrl.endsWith('/')) {
                serverUrl = serverUrl.substring(0, parsedUrl.href.length - 1);
            }
        }

        if (req.baseUrl && req.baseUrl !== '/') {
            res.locals.serverUrl = serverUrl + req.baseUrl;
        } else {
            res.locals.serverUrl = serverUrl;
        }
        next();
    });
};
