/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { FhirConfig, UnauthorizedError } from 'fhir-works-on-aws-interface';
import express from 'express';
import { setTenantIdMiddleware } from './setTenantId';

async function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

describe('SetTenantIdMiddleware', () => {
    describe('success cases', () => {
        test('simple tenantId in custom claim', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'tenantId',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: {} } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        tenantId: 't1',
                        aud: 'aud-Claim-That-Does-Not-Match-For-TenantId-Extraction',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
            expect(res.locals.tenantId).toEqual('t1');
        });

        test('simple tenantId in aud claim', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: {} } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        aud: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev/tenant/t1',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
            expect(res.locals.tenantId).toEqual('t1');
        });

        test('simple tenantId in both aud claim and custom claim', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'tenantId',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: {} } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        aud: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev/tenant/t1',
                        tenantId: 't1',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
            expect(res.locals.tenantId).toEqual('t1');
        });

        test('nested tenantId claim', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'obj.tenantId',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: {} } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        obj: {
                            tenantId: 't1',
                        },
                        aud: ['item1', 'item2'],
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
            expect(res.locals.tenantId).toEqual('t1');
        });
    });

    describe('error cases', () => {
        test('bad path', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'somePathThatIsNotInTheToken',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: {} } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        tenantId: 't1',
                        aud: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
        });

        test('invalidTenantId', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'tenantId',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: {} } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        tenantId: 'InvalidTenantId_#$%&*?',
                        aud: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
        });

        test('tenantId in token does not match tenantId in path', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'tenantId',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: { tenantIdFromPath: 't2' } } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        tenantId: 't1',
                        aud: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
        });

        test('tenantId in aud claim does not match tenantId in custom claim', async () => {
            const fhirConfig = {
                multiTenancyConfig: {
                    enableMultiTenancy: true,
                    tenantIdClaimPath: 'tenantId',
                },
            } as FhirConfig;

            const setTenantIdMiddlewareFn = setTenantIdMiddleware(fhirConfig);
            const nextMock = jest.fn();
            const req = ({ params: { tenantIdFromPath: 't1' } } as unknown) as express.Request;
            const res = ({
                locals: {
                    userIdentity: {
                        claim1: 'val1',
                        tenantId: 't1',
                        aud: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev/tenant/t2',
                    },
                    serverUrl: 'https://xxxx.execute-api.us-east-2.amazonaws.com/dev',
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
        });
    });
});
