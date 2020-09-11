/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { SystemOperation } from 'fhir-works-on-aws-interface';
import { makeOperation } from './cap.rest.resource.template';

export default function makeRest(
    resource: any[],
    security: any,
    globalOperations: SystemOperation[],
    bulkDataAccessEnabled: boolean,
) {
    const rest: any = {
        mode: 'server',
        documentation: 'Main FHIR endpoint',
        security,
        resource,
        interaction: makeOperation(globalOperations),
    };

    if (globalOperations.includes('search-system')) {
        rest.searchParam = [
            {
                name: 'ALL',
                type: 'composite',
                documentation: 'Support all fields.',
            },
        ];
    }
    if (bulkDataAccessEnabled) {
        rest.operation = [
            {
                name: 'export',
                definition:
                    'This FHIR Operation initiates the asynchronous generation of data to which the client is authorized. Currently only system level export is supported. For more information please refer here: http://hl7.org/fhir/uv/bulkdata/export/index.html#bulk-data-kick-off-request',
            },
            {
                name: 'export-poll-status',
                definition:
                    'After a bulk data request has been started, the client MAY poll the status URL provided in the Content-Location header. For more details please refer here: http://hl7.org/fhir/uv/bulkdata/export/index.html#bulk-data-status-request',
            },
        ];
    }
    return rest;
}
