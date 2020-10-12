/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Auth } from 'fhir-works-on-aws-interface';

export default function makeSecurity(authConfig: Auth) {
    if (authConfig.strategy.service) {
        let security = {
            cors: false,
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
        if (authConfig.strategy.oauthAuthorizationUrl) {
            security = {
                ...security,
                ...{
                    extension: [
                        {
                            url: 'https://www.hl7.org/fhir/smart-app-launch/StructureDefinition-oauth-uris.html',
                            extension: [
                                {
                                    url: 'token',
                                    valueUri: authConfig.strategy.oauthTokenUrl,
                                },
                                {
                                    url: 'authorize',
                                    valueUri: authConfig.strategy.oauthAuthorizationUrl,
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
        cors: false,
        description: 'No authentication has been set up',
    };
}
