import { makeLogger } from 'fhir-works-on-aws-interface';

export default function makeComponentLogger(metadata?: any): any {
    return makeLogger({
        component: 'routing',
        ...metadata,
    });
}
