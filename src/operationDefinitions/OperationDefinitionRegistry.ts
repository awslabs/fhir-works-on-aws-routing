/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { Router } from 'express';
import { OperationDefinitionImplementation } from './types';
import ConfigHandler from '../configHandler';

export class OperationDefinitionRegistry {
    private readonly operations: OperationDefinitionImplementation[];

    private readonly routers: Router[];

    constructor(configHandler: ConfigHandler, operations: OperationDefinitionImplementation[]) {
        this.operations = operations;

        this.routers = operations.map(operation => {
            const resourceHandler = configHandler.getResourceHandler(operation.targetResourceType);
            if (!resourceHandler) {
                throw new Error(
                    `Failed to initialize operation ${operation.canonicalUrl}. Is your FhirConfig correct?`,
                );
            }
            console.log(`Enabling operation ${operation.canonicalUrl} at ${operation.path}`);
            return operation.buildRouter(resourceHandler);
        });
    }

    getOperation(method: string, path: string): OperationDefinitionImplementation | undefined {
        return this.operations.find(o => o.path === path && o.httpMethods.includes(method));
    }

    getAllRouters(): Router[] {
        return this.routers;
    }
}
