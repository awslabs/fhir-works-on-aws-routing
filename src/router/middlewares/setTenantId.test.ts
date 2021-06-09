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
        test('simple tenantId claim', async () => {
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
                    },
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
                    },
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
                    },
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
                    },
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
        });

        test('tenantId in token does not match tenantId in token', async () => {
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
                    },
                },
            } as unknown) as express.Response;

            setTenantIdMiddlewareFn(req, res, nextMock);

            await sleep(1);

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(new UnauthorizedError('Unauthorized'));
        });
    });
});
