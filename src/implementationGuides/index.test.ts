/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { StructureDefinitionImplementationGuides } from './index';

describe('StructureDefinitionImplementationGuides', () => {
    describe(`compile`, async () => {
        test(`valid StructureDefinition`, async () => {
            const compiled = new StructureDefinitionImplementationGuides().compile([
                {
                    resourceType: 'StructureDefinition',
                    id: 'CARIN-BB-Organization',
                    url: 'http://hl7.org/fhir/us/carin/StructureDefinition/carin-bb-organization',
                    version: '0.1.0',
                    name: 'CARINBBOrganization',
                    title: 'CARIN Blue Button Organization Profile',
                    status: 'active',
                    date: '2019-12-23T19:40:59+00:00',
                    publisher: 'CARIN Alliance',
                    description:
                        'This profile builds on the USCoreOrganization Profile. It includes additional constraints relevant for the use cases addressed by this IG.',
                    fhirVersion: '4.0.1',
                    kind: 'resource',
                    abstract: false,
                    type: 'Organization',
                    baseDefinition: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-organization',
                    derivation: 'constraint',
                },
            ]);

            await expect(compiled).resolves.toMatchInlineSnapshot(`
                Array [
                  Object {
                    "baseDefinition": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-organization",
                    "description": "This profile builds on the USCoreOrganization Profile. It includes additional constraints relevant for the use cases addressed by this IG.",
                    "name": "CARINBBOrganization",
                    "resourceType": "StructureDefinition",
                    "type": "Organization",
                    "url": "http://hl7.org/fhir/us/carin/StructureDefinition/carin-bb-organization",
                  },
                ]
            `);
        });

        test(`invalid StructureDefinition`, async () => {
            const compiled = new StructureDefinitionImplementationGuides().compile([
                {
                    foo: 'bar',
                },
            ]);
            await expect(compiled).rejects.toThrowError();
        });
    });
});
