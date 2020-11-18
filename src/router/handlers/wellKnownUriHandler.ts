import { SmartStrategy } from 'fhir-works-on-aws-interface';
import { mapKeys } from 'lodash';

export default class WellKnownUriHandler {
    private smartStrategy: SmartStrategy;

    constructor(smartStrategy: SmartStrategy) {
        this.smartStrategy = smartStrategy;
    }

    getWellKnownUriResponse() {
        return mapKeys(this.smartStrategy, (value, key) => {
            return this.camelToSnakeCase(key);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    camelToSnakeCase(str: string) {
        return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
    }
}
