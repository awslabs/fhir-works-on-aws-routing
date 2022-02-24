/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Router } from 'express';
import { CapabilityMode, FhirVersion } from 'fhir-works-on-aws-interface';
import MetadataHandler from '../metadata/metadataHandler';
import ConfigHandler from '../../configHandler';
import { FHIRStructureDefinitionRegistry } from '../../registry';
import { OperationDefinitionRegistry } from '../../operationDefinitions/OperationDefinitionRegistry';

export default class MetadataRoute {
    readonly fhirVersion: FhirVersion;

    readonly router: Router;

    private metadataHandler: MetadataHandler;

    constructor(
        fhirVersion: FhirVersion,
        fhirConfigHandler: ConfigHandler,
        registry: FHIRStructureDefinitionRegistry,
        operationRegistry: OperationDefinitionRegistry,
        hasCORSEnabled: boolean,
    ) {
        this.fhirVersion = fhirVersion;
        this.metadataHandler = new MetadataHandler(fhirConfigHandler, registry, operationRegistry, hasCORSEnabled);
        this.router = express.Router();
        this.init();
    }

    private init() {
        // READ
        this.router.get('/', async (req: express.Request, res: express.Response) => {
            const mode: CapabilityMode = (req.query.mode as CapabilityMode) || 'full';
            const response = await this.metadataHandler.capabilities({
                fhirVersion: this.fhirVersion,
                mode,
                fhirServiceBaseUrl: res.locals.serverUrl,
            });
            res.send(response.resource);
        });
    }
}
