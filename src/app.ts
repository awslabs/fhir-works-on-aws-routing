/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Express } from 'express';
import cors, { CorsOptions } from 'cors';
import {
    cleanAuthHeader,
    getRequestInformation,
    ConfigVersion,
    TypeOperation,
    FhirConfig,
} from 'fhir-works-on-aws-interface';
import GenericResourceRoute from './router/routes/genericResourceRoute';
import ConfigHandler from './configHandler';
import MetadataRoute from './router/routes/metadataRoute';
import ResourceHandler from './router/handlers/resourceHandler';
import RootRoute from './router/routes/rootRoute';
import { applicationErrorMapper, httpErrorHandler, unknownErrorHandler } from './router/routes/errorHandling';

const configVersionSupported: ConfigVersion = 1;

export function generateServerlessRouter(fhirConfig: FhirConfig, supportedGenericResources: string[]): Express {
    if (configVersionSupported !== fhirConfig.configVersion) {
        throw new Error(`This router does not support ${fhirConfig.configVersion} version`);
    }
    const configHandler: ConfigHandler = new ConfigHandler(fhirConfig, supportedGenericResources);
    const { fhirVersion, genericResource } = fhirConfig.profile;
    const serverUrl: string = fhirConfig.server.url;
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(
        express.json({
            type: ['application/json', 'application/fhir+json', 'application/json-patch+json'],
            // 6MB is the maximum payload that Lambda accepts
            limit: '6mb',
        }),
    );
    // Add cors handler before auth to allow pre-flight requests without auth.
    // TODO update fhirConfig.server to supply cors options? Env variable offered as an alternative
    const corsOptions: CorsOptions = process.env.CORS_OPTIONS ? JSON.parse(process.env.CORS_OPTIONS) : {};
    app.use(cors(corsOptions));
    // AuthZ
    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const requestInformation = getRequestInformation(req.method, req.path);
            const accessToken: string = cleanAuthHeader(req.headers.authorization);
            const isAllowed: boolean = await fhirConfig.auth.authorization.isAuthorized({
                ...requestInformation,
                accessToken,
            });
            if (isAllowed) {
                next();
            } else {
                res.status(403).json({ message: 'Forbidden' });
            }
        } catch (e) {
            res.status(403).json({ message: `Forbidden. ${e.message}` });
        }
    });

    // Metadata
    const metadataRoute: MetadataRoute = new MetadataRoute(fhirVersion, configHandler);
    app.use('/metadata', metadataRoute.router);

    // Special Resources
    if (fhirConfig.profile.resources) {
        Object.entries(fhirConfig.profile.resources).forEach(async resourceEntry => {
            const { operations, persistence, typeSearch, typeHistory, fhirVersions } = resourceEntry[1];
            if (fhirVersions.includes(fhirVersion)) {
                const resourceHandler: ResourceHandler = new ResourceHandler(
                    persistence,
                    typeSearch,
                    typeHistory,
                    fhirVersion,
                    serverUrl,
                );

                const route: GenericResourceRoute = new GenericResourceRoute(
                    operations,
                    resourceHandler,
                    fhirConfig.auth.authorization,
                );
                app.use(`/${resourceEntry[0]}`, route.router);
            }
        });
    }

    // Generic Resource Support
    // Make a list of resources to make
    const genericFhirResources: string[] = configHandler.getGenericResources(fhirVersion);
    if (genericResource && genericResource.fhirVersions.includes(fhirVersion)) {
        const genericOperations: TypeOperation[] = configHandler.getGenericOperations(fhirVersion);

        const genericResourceHandler: ResourceHandler = new ResourceHandler(
            genericResource.persistence,
            genericResource.typeSearch,
            genericResource.typeHistory,
            fhirVersion,
            serverUrl,
        );

        const genericRoute: GenericResourceRoute = new GenericResourceRoute(
            genericOperations,
            genericResourceHandler,
            fhirConfig.auth.authorization,
        );

        // Set up Resource for each generic resource
        genericFhirResources.forEach(async (resourceType: string) => {
            app.use(`/${resourceType}`, genericRoute.router);
        });
    }

    // Root Post (Bundle/Global Search)
    if (fhirConfig.profile.systemOperations.length > 0) {
        const rootRoute = new RootRoute(
            fhirConfig.profile.systemOperations,
            fhirVersion,
            serverUrl,
            fhirConfig.profile.bundle,
            fhirConfig.profile.systemSearch,
            fhirConfig.profile.systemHistory,
            fhirConfig.auth.authorization,
            genericFhirResources,
            genericResource,
            fhirConfig.profile.resources,
        );
        app.use('/', rootRoute.router);
    }

    app.use(applicationErrorMapper);
    app.use(httpErrorHandler);
    app.use(unknownErrorHandler);

    return app;
}
