import { Validator } from 'fhir-works-on-aws-interface';

export async function validateResource(validators: Validator[], resource: any): Promise<void> {
    for (let i = 0; i < validators.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await validators[i].validate(resource);
    }
}
