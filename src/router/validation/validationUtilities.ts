/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidResourceError, TypeOperation, Validator } from 'fhir-works-on-aws-interface';

export async function validateResource(
    validators: Validator[],
    resourceType: string,
    resource: any,
    params: { tenantId?: string; typeOperation?: TypeOperation } = {},
): Promise<void> {
    if (resourceType !== resource.resourceType) {
        throw new InvalidResourceError(`not a valid '${resourceType}'`);
    }
    for (let i = 0; i < validators.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await validators[i].validate(resource, params);
    }
}
