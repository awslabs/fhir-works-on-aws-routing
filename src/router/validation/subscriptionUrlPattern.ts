/* global URLPattern */
import 'urlpattern-polyfill';

export default class SubscriptionUrlPattern {
    private readonly urlPattern: URLPattern;

    private readonly patternString: string;

    constructor(patternString: string) {
        this.urlPattern = new URLPattern(patternString);
        this.patternString = patternString;
    }

    matches(url: string): boolean {
        return this.urlPattern.test(url);
    }

    toString(): string {
        return this.patternString;
    }
}
