import { FhirVersion } from 'fhir-works-on-aws-interface';
import { FhirStructureDefinition } from "../implementationGuides";


export interface StructureDefinition {
    type: string;
    supportedProfile: string[];
}

export interface StructureDefinitionCapabilityStatement {
    [resourceType: string]: StructureDefinition;
}

/**
 * This class is the single authority over the supported FHIR StructuredDefinition and their definitions
 */
export class FHIRStructureDefinitionRegistry {
    private readonly capabilityStatement: StructureDefinitionCapabilityStatement;

    constructor(fhirVersion: FhirVersion, compiledImplementationGuides: any[]) {
        let compiledStructureDefinitions: FhirStructureDefinition[] = [ ...compiledImplementationGuides];

        this.capabilityStatement = {};

        compiledStructureDefinitions.forEach(structureDefinition => {
            this.capabilityStatement[structureDefinition.name] = this.capabilityStatement[structureDefinition.name] ?? [];
            this.capabilityStatement[structureDefinition.name].push({
                type: structureDefinition.name,
                supportedProfile: structureDefinition.supportedProfile
            });
        });
    }

    /**
     * Retrieve the profiles for a given resource type. Returns undefined if the parameter is not found on the registry.
     * @param resourceType FHIR resource type
     * @return a list of profiles
     */
    getProfiles(resourceType): string[] {
        return this.capabilityStatement[resourceType]?.supportedProfile ?? [];
    }

    /**
     * Retrieve a subset of the CapabilityStatement with the resource definitions
     * See https://www.hl7.org/fhir/capabilitystatement.html
     */
    getCapabilities(): StructureDefinitionCapabilityStatement {
        return this.capabilityStatement;
    }
}
