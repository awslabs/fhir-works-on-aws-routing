/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    Authorization,
    AuthorizationBundleRequest,
    AllowedResourceTypesForOperationRequest,
    ReadResponseAuthorizedRequest,
    VerifyAccessTokenRequest,
    WriteRequestAuthorizedRequest,
    AccessBulkDataJobRequest,
    KeyValueMap,
    GetSearchFilterBasedOnIdentityRequest,
    SearchFilter,
} from 'fhir-works-on-aws-interface';

let expectedtokenDecoded: any;

export function setExpectedTokenDecoded(newTokenDecoded: any): void {
    expectedtokenDecoded = newTokenDecoded;
}
const AuthorizationService: Authorization = class {
    static async verifyAccessToken(request: VerifyAccessTokenRequest): Promise<KeyValueMap> {
        if (expectedtokenDecoded) {
            return expectedtokenDecoded;
        }
        return {
            sub: 'fake',
            'cognito:groups': ['practitioner'],
            name: 'not real',
            iat: 1516239022,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static async isAccessBulkDataJobAllowed(request: AccessBulkDataJobRequest): Promise<void> {}

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static async isBundleRequestAuthorized(request: AuthorizationBundleRequest): Promise<void> {}

    static async authorizeAndFilterReadResponse(request: ReadResponseAuthorizedRequest): Promise<any> {
        // Currently no additional filtering/checking is needed for RBAC
        return request.readResponse;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    static async isWriteRequestAuthorized(request: WriteRequestAuthorizedRequest): Promise<void> {}

    static async getAllowedResourceTypesForOperation(
        request: AllowedResourceTypesForOperationRequest,
    ): Promise<string[]> {
        return ['Patient', 'Observation', 'Questionnaire', 'QuestionnaireResponse', 'Practitioner'];
    }

    static async getSearchFilterBasedOnIdentity(
        request: GetSearchFilterBasedOnIdentityRequest,
    ): Promise<SearchFilter[]> {
        return [];
    }
};

export default AuthorizationService;
