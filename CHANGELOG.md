# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.0.0](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v4.0.3...v5.0.0) (2021-02-11)


### ⚠ BREAKING CHANGES

* updated to interface 8.0.0 which changed the structure of FhirConfig. FhirConfig now requires the validators attribute. That attribute is then used in routing. 

### Features

* Add support for Validator interface ([#56](https://github.com/awslabs/fhir-works-on-aws-routing/issues/56)) ([b57b54c](https://github.com/awslabs/fhir-works-on-aws-routing/commit/b57b54c7ee0ef67799a14ffb6bc66a7e25977659))

### [4.0.3](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v4.0.1...v4.0.3) (2021-01-27)

### Chore

* Update interface and pass values to AuthZ ([#45](https://github.com/awslabs/fhir-works-on-aws-routing/issues/48)) ([e6de625d](https://github.com/awslabs/fhir-works-on-aws-routing/commit/93a7933877fcb73561941c8e12aa5b05e6de625d))

### [4.0.2](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v4.0.1...v4.0.2) (2021-01-20)


### Bug Fixes

* use correct SMART url in Cap Statement ([#45](https://github.com/awslabs/fhir-works-on-aws-routing/issues/45)) ([71bf256](https://github.com/awslabs/fhir-works-on-aws-routing/commit/71bf25699d78828f519d913700af655430f29b7c))

### [4.0.1](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v4.0.0...v4.0.1) (2021-01-14)


### Bug Fixes

* add cors typing to dependencies ([#43](https://github.com/awslabs/fhir-works-on-aws-routing/issues/43)) ([46d4a59](https://github.com/awslabs/fhir-works-on-aws-routing/commit/46d4a596e45da80d19014333ac13b2fd831484b6))

## [4.0.0](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v3.0.1...v4.0.0) (2021-01-13)


### ⚠ BREAKING CHANGES

* updated to interface 7.0.0 which changed the structure of `FhirConfig` that is used as argument for `generateServerlessRouter`

### Features

* Support additional product info used in the Capability Statement ([#31](https://github.com/awslabs/fhir-works-on-aws-routing/issues/31)) ([5a61db3](https://github.com/awslabs/fhir-works-on-aws-routing/commit/5a61db3ac3b50116bdd119b98a929065676a0d0a))
* use getSearchFilterBasedOnIdentity to prefilter resources([#38](https://github.com/awslabs/fhir-works-on-aws-routing/issues/38)) ([b3fd394](https://github.com/awslabs/fhir-works-on-aws-routing/commit/b3fd3949227b7126722056e4940dd5f161d0ce06))
* use search getCapabilities to build capability statement ([#41](https://github.com/awslabs/fhir-works-on-aws-routing/issues/41)) ([5f4340d](https://github.com/awslabs/fhir-works-on-aws-routing/commit/5f4340d83d213d8d46794eba3845110605db0918))


### Bug Fixes

* Add authorizeAndFilterReadResponse for system searches ([#36](https://github.com/awslabs/fhir-works-on-aws-routing/issues/36)) ([104098d](https://github.com/awslabs/fhir-works-on-aws-routing/commit/104098d32f26403587c69045266a1581ffa163ed))
* authorize requester has permission to view all resources returned in the Bundle ([#32](https://github.com/awslabs/fhir-works-on-aws-routing/issues/32)) ([155e926](https://github.com/awslabs/fhir-works-on-aws-routing/commit/155e926a5598b13e110b5e71468337386e75ebb4))
* When parsing Bundles for reference only fields explicitly named 'reference' should be considered a reference ([#35](https://github.com/awslabs/fhir-works-on-aws-routing/issues/35)) ([b931d52](https://github.com/awslabs/fhir-works-on-aws-routing/commit/b931d5248673e5941709d5b2920819fa4a5b2e4d))

## [3.0.1] - 2020-12-07

### Added

- chore: Explicity check if Auth strategy is SMART-on-FHIR before adding the well-known route
- fix: metadata and well-known endpoint so that AuthZ is not invoked (expected behavior)

## [3.0.0] - 2020-11-20

### Added

- Support SMART's .well_known endpoint
- Supporting new authorization interface
- Add optional OAuth urls to the capability statement

## [2.0.0] - 2020-11-11

### Added

- Support for DB export by routing export requests to the corresponding BulkDataAccess interfaces as defined in `fhir-works-on-aws-interface` v3.0.0
- Supporting capability statement configuration for OAuth as defined in `fhir-works-on-aws-interface` v3.0.0
- Improved error handling to allow matching of same error objects across different `fhir-works-on-aws-interface` versions
- Support for configuring CORs header

## [1.1.0] - 2020-09-25

- feat: Pass down allowed resource types to search service

## [1.0.0] - 2020-08-31

### Added

- Initial launch! :rocket:
