/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidResourceError } from 'fhir-works-on-aws-interface';
import JsonSchemaValidator from './jsonSchemaValidator';
import validPatient from '../../../sampleData/validV4Patient.json';
import invalidPatient from '../../../sampleData/invalidV4Patient.json';
import validV3Account from '../../../sampleData/validV3Account.json';

describe('Validating V4 resources', () => {
    const validatorV4 = new JsonSchemaValidator('4.0.1');
    test('No error when validating valid resource', async () => {
        await expect(validatorV4.validate(validPatient)).resolves.toEqual(undefined);
    });

    test('Show error when validating invalid resource', async () => {
        await expect(validatorV4.validate(invalidPatient)).rejects.toThrowError(
            new InvalidResourceError(
                "Failed to parse request body as JSON resource. Error was: data.text should have required property 'div', data.gender should be equal to one of the allowed values",
            ),
        );
    });

    test('Show error when checking for wrong version of FHIR resource', async () => {
        await expect(validatorV4.validate(validV3Account)).rejects.toThrowError(
            new InvalidResourceError(
                'Failed to parse request body as JSON resource. Error was: data should NOT have additional properties, data should NOT have additional properties, data should NOT have additional properties, data.subject should be array',
            ),
        );
    });
});

describe('Validating V3 resources', () => {
    const validatorV3 = new JsonSchemaValidator('3.0.1');
    test('No error when validating valid v3 resource', async () => {
        await expect(validatorV3.validate(validV3Account)).resolves.toEqual(undefined);
    });

    // TODO: Validator does not validate v3 Bundles correctly
    test.skip('No error when validating valid v3 Bundle', async () => {
        const bundle = {
            resourceType: 'Bundle',
            type: 'transaction',
            entry: [
                {
                    resource: {
                        resourceType: 'Patient',
                        name: [{ family: 'Smith', given: ['John'] }],
                        gender: 'male',
                    },
                    request: { method: 'POST', url: 'Patient' },
                },
            ],
        };

        await expect(validatorV3.validate(bundle)).resolves.toEqual(undefined);
    });

    test('Show error when validating invalid resource', async () => {
        await expect(validatorV3.validate(invalidPatient)).rejects.toThrowError(
            new InvalidResourceError(
                "Failed to parse request body as JSON resource. Error was: data.text should have required property 'div', data.gender should be equal to one of the allowed values",
            ),
        );
    });
});
