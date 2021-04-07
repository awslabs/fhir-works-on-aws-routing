/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidResourceError, Validator } from 'fhir-works-on-aws-interface';
import { Lambda } from 'aws-sdk';
import AWS from '../../AWS';

interface ErrorMessage {
    severity: string;
    msg: string;
}

interface HapiValidatorResponse {
    errorMessages: ErrorMessage[];
    successful: boolean;
}
// a relatively high number to give cold starts a chance to succeed
const TIMEOUT_MILLISECONDS = 25_000;

export default class HapiFhirLambdaValidator implements Validator {
    private hapiValidatorLambdaArn: string;

    private lambdaClient: Lambda;

    constructor(hapiValidatorLambdaArn: string) {
        this.hapiValidatorLambdaArn = hapiValidatorLambdaArn;
        this.lambdaClient = new AWS.Lambda({
            httpOptions: {
                timeout: TIMEOUT_MILLISECONDS,
            },
        });
    }

    async validate(resource: any): Promise<void> {
        const params = {
            FunctionName: this.hapiValidatorLambdaArn,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(JSON.stringify(resource)),
        };

        const lambdaResponse = await this.lambdaClient.invoke(params).promise();

        if (lambdaResponse.FunctionError) {
            // this means that the lambda function crashed, not necessarily that the resource is invalid.
            const msg = `The execution of ${this.hapiValidatorLambdaArn} lambda function failed`;
            console.log(msg, lambdaResponse);
            throw new Error(msg);
        }
        // response payload is always a string. the Payload type is also used for invoke parameters
        const hapiValidatorResponse = JSON.parse(lambdaResponse.Payload as string) as HapiValidatorResponse;
        if (hapiValidatorResponse.successful) {
            return;
        }

        const allErrorMessages = hapiValidatorResponse.errorMessages
            .filter(e => e.severity === 'error')
            .map(e => e.msg)
            .join('\n');

        throw new InvalidResourceError(allErrorMessages);
    }
}
