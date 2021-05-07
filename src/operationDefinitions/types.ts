/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { SystemOperation, TypeOperation } from 'fhir-works-on-aws-interface';

export interface OperationDefinitionImplementation {
    /**
     * url of the corresponding OperationDefinition resource
     */
    canonicalUrl: string;

    /**
     * Request information used to resolve AuthZ. This is applicable to OperationDefinitions that can be mapped to
     * the AuthZ rules of an existing SystemOperation/TypeOperation.
     *
     * For example, the $docref operation from US Core is effectively a 'search-type' operation on 'DocumentReference'.
     */
    requestInformation: {
        operation: TypeOperation | SystemOperation;
        resourceType?: string;
        id?: string;
        vid?: string;
    };
    /**
     * express router that contains the implementation of the operation. It will be mounted on "/"
     */
    router: Router;
}
