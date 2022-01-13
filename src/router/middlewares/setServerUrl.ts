/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { FhirConfig } from 'fhir-works-on-aws-interface';
import express from 'express';
import RouteHelper from '../routes/routeHelper';
import { isEmpty, isUndefined } from 'lodash';

/**
 * Sets the value of `res.locals.serverUrl`
 * the serverUrl can either be a static value from FhirConfig of a dynamic value for some multi-tenancy setups.
 */
export const setServerUrlMiddleware: (
    fhirConfig: FhirConfig,
) => (req: express.Request, res: express.Response, next: express.NextFunction) => void = (fhirConfig: FhirConfig) => {
    return RouteHelper.wrapAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let serverUrl = fhirConfig.server.url
        if (!isEmpty(fhirConfig.server.alternativeUrls)){
            const hostMatch = fhirConfig.server.alternativeUrls?.find((alternativeUrl: string)=>{
                return alternativeUrl === req.headers.host;
            });
            if (!isUndefined(hostMatch)){
                serverUrl = hostMatch; 
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
