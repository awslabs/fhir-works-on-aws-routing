/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Capabilities, CapabilitiesRequest, FhirVersion, GenericResponse } from 'fhir-works-on-aws-interface';
import createError from 'http-errors';
import { makeGenericResources, makeResource } from './cap.rest.resource.template';
import makeSecurity from './cap.rest.security.template';
import makeRest from './cap.rest.template';
import makeStatement from './cap.template';
import ConfigHandler from '../../configHandler';

export default class MetadataHandler implements Capabilities {
    configHandler: ConfigHandler;

    readonly hasCORSEnabled: boolean;

    constructor(handler: ConfigHandler, hasCORSEnabled: boolean = false) {
        this.configHandler = handler;
        this.hasCORSEnabled = hasCORSEnabled;
    }

    private generateResources(fhirVersion: FhirVersion) {
        const specialResourceTypes = this.configHandler.getSpecialResourceTypes(fhirVersion);
        let generatedResources = [];
        if (this.configHandler.config.profile.genericResource) {
            const generatedResourcesTypes = this.configHandler.getGenericResources(fhirVersion, specialResourceTypes);
            generatedResources = makeGenericResources(
                generatedResourcesTypes,
                this.configHandler.getGenericOperations(fhirVersion),
            );
        }

        // Add the special resources
        specialResourceTypes.forEach((resourceType: string) => {
            generatedResources.push(
                makeResource(resourceType, this.configHandler.getSpecialResourceOperations(resourceType, fhirVersion)),
            );
        });

        return generatedResources;
    }

    async capabilities(request: CapabilitiesRequest): Promise<GenericResponse> {
        const { auth, orgName, server, profile } = this.configHandler.config;

        if (!this.configHandler.isVersionSupported(request.fhirVersion)) {
            throw new createError.NotFound(`FHIR version ${request.fhirVersion} is not supported`);
        }

        const generatedResources = this.generateResources(request.fhirVersion);
        const security = makeSecurity(auth, this.hasCORSEnabled);
        const rest = makeRest(generatedResources, security, profile.systemOperations, !!profile.bulkDataAccess);
        const capStatement = makeStatement(rest, orgName, server.url, request.fhirVersion);

        return {
            message: 'success',
            resource: capStatement,
        };
    }
}
