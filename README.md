# fhir-works-on-aws-routing

## Purpose

Please visit [fhir-works-on-aws-deployment](https://github.com/awslabs/fhir-works-on-aws-deployment) for overall vision of the project and for more context.

This package is an implementation of the routing of the fhir interface. It is responsible for taking a FHIR based request and routing it to the correct sub-component. The behavior and routing logic of this router is dependent on the fhir configuration. To use and deploy this component (with the other default components) please follow the overall [README](https://github.com/awslabs/fhir-works-on-aws-deployment)

## Usage

For usage please add this package to your `package.json` file and install as a dependency. For usage examples please see the [deployment component](https://github.com/awslabs/fhir-works-on-aws-deployment)

## Dependency tree

This package is dependent on a type of each subcomponent:

- [interface component](https://github.com/awslabs/fhir-works-on-aws-interface)
  - This package defines the interface we are trying to use
- An **authorization** component that is responsible for saying if the request is allowed or not
  - Example: [fhir-works-on-aws-authz-rbac](https://github.com/awslabs/fhir-works-on-aws-authz-rbac)
- A **persistence** component that is responsible for handing CRUD based requests
  - Example: [fhir-works-on-aws-persistence-ddb](https://github.com/awslabs/fhir-works-on-aws-persistence-ddb)
- A **bundle** based component that is responsible for handling batches & transactions
  - Example: [fhir-works-on-aws-persistence-ddb](https://github.com/awslabs/fhir-works-on-aws-persistence-ddb)
- A **search** component that is responsible for handling the search based requests
  - Example: [fhir-works-on-aws-search-es](https://github.com/awslabs/fhir-works-on-aws-search-es)
- A **history** component that is responsible for handling the historical search requests
  - No example
- Finally a deployment component to deploy this to AWS
  - Example: [fhir-works-on-aws-deployment](https://github.com/awslabs/fhir-works-on-aws-deployment)

**NOTE:** if your use-case does not require one of the above features/components, please set the your configuration as such and the router will route accordingly

## Known issues

For known issues please track the issues on the GitHub repository

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
