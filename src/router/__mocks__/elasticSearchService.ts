import {
    Search,
    SearchResponse,
    GlobalSearchRequest,
    TypeSearchRequest,
    SearchCapabilityStatement,
} from 'fhir-works-on-aws-interface';

let expectedSearchSet: any[] = [];

export function setExpectedSearchSet(entries: any[]) {
    expectedSearchSet = entries;
}

const ElasticSearchService: Search = class {
    /*
    searchParams => {field: value}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async typeSearch(request: TypeSearchRequest) {
        return {
            success: true,
            result: {
                numberOfResults: expectedSearchSet.length,
                message: '',
                entries: expectedSearchSet.map((x) => {
                    // Adapt fullUrl with base server url
                    const entry = x;
                    entry.fullUrl = `${request.baseUrl}/${x.fullUrl}`;
                    return entry;
                }),
            },
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static globalSearch(request: GlobalSearchRequest): Promise<SearchResponse> {
        throw new Error('Method not implemented.');
    }

    static async getCapabilities(): Promise<SearchCapabilityStatement> {
        const dummy: SearchCapabilityStatement = {};
        return dummy;
    }

    static validateSubscriptionSearchCriteria(searchCriteria: string): void {
        console.log(searchCriteria);
    }
};
export default ElasticSearchService;
