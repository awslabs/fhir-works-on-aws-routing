/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { SystemOperation, TypeOperation } from 'fhir-works-on-aws-interface';
import ResourceHandler from '../router/handlers/resourceHandler';

export interface OperationDefinitionImplementation {
    /**
     * url of the corresponding OperationDefinition resource
     */
    readonly canonicalUrl: string;

    /**
     * url path used to invoke the operation
     * @example '/DocumentReference/$docref'
     */
    readonly path: string;

    /**
     * Http verbs (methods) supported by this operation e.g GET, POST
     */
    readonly httpVerbs: string[];

    /**
     * FHIR resourceType that is affected by this operation
     */
    readonly targetResourceType: string;

    /**
     * Request information used to resolve AuthZ. This is applicable to OperationDefinitions that can be mapped to
     * the AuthZ rules of an existing SystemOperation/TypeOperation.
     *
     * For example, the $docref operation from US Core is effectively a 'search-type' operation on 'DocumentReference'.
     */
    readonly requestInformation: {
        operation: TypeOperation | SystemOperation;
        resourceType?: string;
        id?: string;
        vid?: string;
    };
    /**
     * express router that contains the implementation of the operation. It will be mounted on "/"
     */
    buildRouter(resourceHandler: ResourceHandler): Router;
}
