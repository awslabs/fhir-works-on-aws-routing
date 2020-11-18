import { SmartStrategy } from 'fhir-works-on-aws-interface';
import { mapKeys } from 'lodash';

export function camelToSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
}

export function getWellKnownUriResponse(smartStrategy: SmartStrategy) {
    return mapKeys(smartStrategy, (value, key) => {
        return camelToSnakeCase(key);
    });
}
