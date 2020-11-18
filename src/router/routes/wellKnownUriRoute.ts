/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Router } from 'express';
import { SmartStrategy } from 'fhir-works-on-aws-interface';
import WellKnownUriHandler from '../handlers/wellKnownUriHandler';

export default class WellKnownUriRouteRoute {
    readonly router: Router;

    private wellKnownUriHandler: WellKnownUriHandler;

    constructor(smartStrategy: SmartStrategy) {
        this.router = express.Router();
        this.wellKnownUriHandler = new WellKnownUriHandler(smartStrategy);
        this.init();
    }

    private init() {
        this.router.get('/', async (req: express.Request, res: express.Response) => {
            const response = this.wellKnownUriHandler.getWellKnownUriResponse();
            res.send(response);
        });
    }
}
