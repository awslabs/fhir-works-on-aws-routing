/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { KeyValueMap } from 'fhir-works-on-aws-interface';

export default interface CrudHandlerInterface {
    create(resourceType: string, resource: any): any;
    update(resourceType: string, id: string, resource: any): any;
    patch(resourceType: string, id: string, resource: any): any;
    read(resourceType: string, id: string): any;
    vRead(resourceType: string, id: string, vid: string): any;
    delete(resourceType: string, id: string): any;
    typeSearch(resourceType: string, searchParams: any, allowedResourceTypes: string[], userIdentity: KeyValueMap): any;
    typeHistory(resourceType: string, searchParams: any, userIdentity: KeyValueMap): any;
    instanceHistory(resourceType: string, id: string, searchParams: any, userIdentity: KeyValueMap): any;
}
