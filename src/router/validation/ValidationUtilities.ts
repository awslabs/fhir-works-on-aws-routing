import { Validator } from 'fhir-works-on-aws-interface';

export async function validateResource(validators: Validator[], resource: any) {
    return Promise.all(
        validators.map((validator: Validator) => {
            return validator.validate(resource);
        }),
    );
}
