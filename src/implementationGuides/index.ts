/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ImplementationGuides } from 'fhir-works-on-aws-interface';

/**
 * Based on the FHIR StructuredDefinition. This type only includes the fields that are required for the compile process.
 * See: http://www.hl7.org/fhir/structuredefinition.html
 */
export type FhirStructureDefinition = {
    resourceType: 'StructureDefinition';
    url: string;
    name: string;
    description: string;
    baseDefinition: string;
    type: string;
};

/**
 * This class compiles StructuredDefinitions from IG packages
 */
export class StructureDefinitionImplementationGuides implements ImplementationGuides {
    /**
     * Compiles the contents of an Implementation Guide into an internal representation used to build the Capability Statement
     *
     * @param resources - an array of FHIR resources. See: https://www.hl7.org/fhir/profiling.html
     */
    // eslint-disable-next-line class-methods-use-this
    async compile(resources: any[]): Promise<any> {
        const validStructureDefinitions: FhirStructureDefinition[] = [];
        resources.forEach(s => {
            if (StructureDefinitionImplementationGuides.isFhirStructureDefinition(s)) {
                validStructureDefinitions.push(s);
            } else {
                throw new Error(`The following input is not a StructureDefinition: ${s.type} ${s.name}`);
            }
        });

        return validStructureDefinitions.map((structureDefinition: any) => ({
            name: structureDefinition.name,
            url: structureDefinition.url,
            type: structureDefinition.type,
            resourceType: structureDefinition.resourceType,
            description: structureDefinition.description,
            baseDefinition: structureDefinition.baseDefinition,
        }));
    }

    private static isFhirStructureDefinition(x: any): x is FhirStructureDefinition {
        return (
            typeof x === 'object' &&
            x &&
            x.resourceType === 'StructureDefinition' &&
            typeof x.url === 'string' &&
            typeof x.name === 'string' &&
            typeof x.description === 'string' &&
            typeof x.baseDefinition === 'string' &&
            typeof x.type === 'string'
        );
    }
}
