// eslint-disable-next-line import/no-extraneous-dependencies
import { mockRequest, mockResponse } from 'mock-req-res';
import ExportRouteHelper from './exportRouteHelper';

describe('buildInitiateExportRequest', () => {
    const mockedResponse = mockResponse({
        locals: {
            requesterUserId: 'abcd-1234',
        },
    });

    const TEN_DIGIT_NUMBER_REG_EXPRESSION = /\d{10}/;

    test('System Export request with query parameters', () => {
        const req = mockRequest({
            query: {
                _outputFormat: 'ndjson',
                _since: 1599158340,
                _type: 'Patient',
            },
        });

        const actualInitiateExportRequest = ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'system');
        expect(actualInitiateExportRequest).toMatchObject({
            requesterUserId: 'abcd-1234',
            exportType: 'system',
            outputFormat: 'ndjson',
            since: 1599158340,
            type: 'Patient',
        });
        expect(actualInitiateExportRequest.transactionTime.toString(10)).toEqual(
            expect.stringMatching(TEN_DIGIT_NUMBER_REG_EXPRESSION),
        );
    });

    test('Group Export request with query parameters', () => {
        const req = mockRequest({
            query: {
                _outputFormat: 'ndjson',
                _since: 1599158340,
                _type: 'Patient',
            },
            params: {
                id: '1',
            },
        });

        const actualInitiateExportRequest = ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'group');
        expect(actualInitiateExportRequest).toMatchObject({
            requesterUserId: 'abcd-1234',
            exportType: 'group',
            outputFormat: 'ndjson',
            since: 1599158340,
            type: 'Patient',
            groupId: '1',
        });
        expect(actualInitiateExportRequest.transactionTime.toString(10)).toEqual(
            expect.stringMatching(TEN_DIGIT_NUMBER_REG_EXPRESSION),
        );
    });

    test('Group Export request without query parameters', () => {
        const req = mockRequest({
            params: {
                id: '1',
            },
        });

        const actualInitiateExportRequest = ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'group');
        expect(actualInitiateExportRequest).toMatchObject({
            requesterUserId: 'abcd-1234',
            exportType: 'group',
            outputFormat: undefined,
            since: undefined,
            type: undefined,
            groupId: '1',
        });
        expect(actualInitiateExportRequest.transactionTime.toString(10)).toEqual(
            expect.stringMatching(TEN_DIGIT_NUMBER_REG_EXPRESSION),
        );
    });

    test('Group Export request with non-supported outputFormat', () => {
        expect.hasAssertions();
        const req = mockRequest({
            query: {
                _outputFormat: 'json',
            },
            params: {
                id: '1',
            },
        });

        try {
            ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'group');
        } catch (e) {
            expect(e.name).toEqual('BadRequestError');
            expect(e.message).toEqual('We only support exporting resources into ndjson formatted file');
        }
    });
});
