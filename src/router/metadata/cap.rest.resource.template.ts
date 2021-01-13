/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
    TypeOperation,
    SystemOperation,
    SearchCapabilityStatement,
    SearchCapabilities,
    Resource,
} from 'fhir-works-on-aws-interface';

function makeResourceObject(
    resourceType: string,
    resourceOperations: any[],
    updateCreate: boolean,
    hasTypeSearch: boolean,
    searchCapabilities?: SearchCapabilities,
) {
    const result: any = {
        type: resourceType,
        interaction: resourceOperations,
        versioning: 'versioned',
        readHistory: false,
        updateCreate, // TODO do we actually do updateCreate?
        conditionalCreate: false,
        conditionalRead: 'not-supported',
        conditionalUpdate: false,
        conditionalDelete: 'not-supported',
    };

    if (hasTypeSearch && searchCapabilities !== undefined) {
        Object.assign(result, searchCapabilities);
    }

    return result;
}

export function makeOperation(operations: (TypeOperation | SystemOperation)[]) {
    const resourceOperations: any[] = [];

    operations.forEach(operation => {
        resourceOperations.push({ code: operation });
    });

    return resourceOperations;
}

export function makeGenericResources(
    fhirResourcesToMake: string[],
    operations: TypeOperation[],
    searchCapabilityStatement: SearchCapabilityStatement,
) {
    const resources: any[] = [];

    const resourceOperations: any[] = makeOperation(operations);
    const updateCreate: boolean = operations.includes('update');
    const hasTypeSearch: boolean = operations.includes('search-type');

    fhirResourcesToMake.forEach((resourceType: string) => {
        resources.push(
            makeResourceObject(
                resourceType,
                resourceOperations,
                updateCreate,
                hasTypeSearch,
                searchCapabilityStatement[resourceType],
            ),
        );
    });

    return resources;
}

export async function makeResource(resourceType: string, resource: Resource) {
    const resourceOperations: any[] = makeOperation(resource.operations);
    const updateCreate: boolean = resource.operations.includes('update');
    const hasTypeSearch: boolean = resource.operations.includes('search-type');

    const capabilities: SearchCapabilityStatement = hasTypeSearch ? await resource.typeSearch.getCapabilities() : {};

    return makeResourceObject(
        resourceType,
        resourceOperations,
        updateCreate,
        hasTypeSearch,
        capabilities[resourceType],
    );
}
