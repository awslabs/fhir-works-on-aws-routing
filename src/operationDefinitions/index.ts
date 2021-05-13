/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { OperationDefinitionImplementation } from './types';
import { USCoreDocRef } from './USCoreDocRef';
import { OperationDefinitionRegistry } from './OperationDefinitionRegistry';
import ConfigHandler from '../configHandler';

export const initializeOperationRegistry = (configHandler: ConfigHandler) => {
    const { compiledImplementationGuides } = configHandler.config.profile;
    const operations: OperationDefinitionImplementation[] = [];

    if (
        compiledImplementationGuides &&
        compiledImplementationGuides.find(
            (x: any) => x.resourceType === 'OperationDefinition' && x.url === USCoreDocRef.canonicalUrl,
        )
    ) {
        operations.push(USCoreDocRef);
    }

    return new OperationDefinitionRegistry(configHandler, operations);
};
