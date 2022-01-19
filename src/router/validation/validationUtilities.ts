/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Validator, VerbType } from 'fhir-works-on-aws-interface';

export async function validateResource(
    validators: Validator[],
    resource: any,
    params: { tenantId?: string; httpVerb?: VerbType } = {},
): Promise<void> {
    for (let i = 0; i < validators.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await validators[i].validate(resource, params);
    }
}
