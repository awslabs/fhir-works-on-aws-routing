/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Auth } from 'fhir-works-on-aws-interface';

export default function makeSecurity(authConfig: Auth, hasCORSEnabled: boolean = false) {
    if (authConfig.strategy.service) {
        let security = {
            cors: hasCORSEnabled,
            service: [
                {
                    coding: [
                        {
                            system: 'https://www.hl7.org/fhir/codesystem-restful-security-service.html',
                            code: authConfig.strategy.service,
                        },
                    ],
                },
            ],
        };
        if (authConfig.strategy.oauth) {
            security = {
                ...security,
                ...{
                    extension: [
                        {
                            url: 'https://www.hl7.org/fhir/smart-app-launch/StructureDefinition-oauth-uris.html',
                            extension: [
                                {
                                    url: 'token',
                                    valueUri: authConfig.strategy.oauth.tokenEndpoint,
                                },
                                {
                                    url: 'authorize',
                                    valueUri: authConfig.strategy.oauth.authorizationEndpoint,
                                },
                            ],
                        },
                    ],
                    description: 'Uses OAuth2 as a way to authentication & authorize users',
                },
            };
        }
        return security;
    }

    return {
        cors: hasCORSEnabled,
        description: 'No authentication has been set up',
    };
}
