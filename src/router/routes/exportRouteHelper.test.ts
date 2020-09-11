// eslint-disable-next-line import/no-extraneous-dependencies
import { mockRequest, mockResponse } from 'mock-req-res';
import ExportRouteHelper from './exportRouteHelper';
import { utcTimeRegExp } from '../../regExpressions';

describe('buildInitiateExportRequest', () => {
    const mockedResponse = mockResponse({
        locals: {
            requesterUserId: 'abcd-1234',
        },
    });

    test('System Export request with query parameters', () => {
        const req = mockRequest({
            query: {
                _outputFormat: 'ndjson',
                _since: '2020-09-01T00:00:00Z',
                _type: 'Patient',
            },
        });

        const actualInitiateExportRequest = ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'system');
        expect(actualInitiateExportRequest).toMatchObject({
            requesterUserId: 'abcd-1234',
            transactionTime: expect.stringMatching(utcTimeRegExp),
            exportType: 'system',
            outputFormat: 'ndjson',
            since: '2020-09-01T00:00:00Z',
            type: 'Patient',
        });
    });

    test('Group Export request with query parameters', () => {
        const req = mockRequest({
            query: {
                _outputFormat: 'ndjson',
                _since: '2020-09-01T00:00:00Z',
                _type: 'Patient',
            },
            params: {
                id: '1',
            },
        });

        const actualInitiateExportRequest = ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'group');
        expect(actualInitiateExportRequest).toMatchObject({
            requesterUserId: 'abcd-1234',
            transactionTime: expect.stringMatching(utcTimeRegExp),
            exportType: 'group',
            outputFormat: 'ndjson',
            since: '2020-09-01T00:00:00Z',
            type: 'Patient',
            groupId: '1',
        });
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
    test('Group Export request with non-supported since', () => {
        expect.hasAssertions();
        const req = mockRequest({
            query: {
                _since: '2020-10-12',
            },
            params: {
                id: '1',
            },
        });

        try {
            ExportRouteHelper.buildInitiateExportRequest(req, mockedResponse, 'group');
        } catch (e) {
            expect(e.name).toEqual('BadRequestError');
            expect(e.message).toEqual(
                "Query '_since' should be in the FHIR Instant format: YYYY-MM-DDThh:mm:ssZ. Exp. 2020-09-01T00:00:00Z",
            );
        }
    });
});
