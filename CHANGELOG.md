# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.4.3](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.4.2...v5.4.3) (2021-07-27)


### Bug Fixes

* properly handle versioned references in BundleParser ([#101](https://github.com/awslabs/fhir-works-on-aws-routing/issues/101)) ([b57ac06](https://github.com/awslabs/fhir-works-on-aws-routing/commit/b57ac06e8578fd2e701b52e1b262e482536dc999))
* update FHIR v4 schema and fix the validator ([#102](https://github.com/awslabs/fhir-works-on-aws-routing/issues/102)) ([b9e2f5f](https://github.com/awslabs/fhir-works-on-aws-routing/commit/b9e2f5ffe414031ea29ad0c432c66fc8303a0afe))

### [5.4.2](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.4.1...v5.4.2) (2021-06-04)


### Bug Fixes

* Changed error for Unauthorized request([#92](https://github.com/awslabs/fhir-works-on-aws-routing/issues/92)) ([83f8d23](https://github.com/awslabs/fhir-works-on-aws-routing/commit/83f8d2317bdbc7c8ae0e4fb3b382c2ac2f9ce97c))
* remove informational HTTP header ([#89](https://github.com/awslabs/fhir-works-on-aws-routing/issues/89)) ([f8f4238](https://github.com/awslabs/fhir-works-on-aws-routing/commit/f8f423813ff8d591c17d952d79989bd934f549a9))

### [5.4.1](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.4.0...v5.4.1) (2021-05-21)

## [5.4.0](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.3.0...v5.4.0) (2021-05-21)


### Features

* add $docref operation ([#86](https://github.com/awslabs/fhir-works-on-aws-routing/issues/86)) ([105790f](https://github.com/awslabs/fhir-works-on-aws-routing/commit/105790fbd84e1886e000844be8a7fa0ea1d532d6)), closes [#78](https://github.com/awslabs/fhir-works-on-aws-routing/issues/78) [#83](https://github.com/awslabs/fhir-works-on-aws-routing/issues/83) [#85](https://github.com/awslabs/fhir-works-on-aws-routing/issues/85)

## [5.3.0](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.2.1...v5.3.0) (2021-05-19)


### Features

* create requestContext and pass it along with userIdentity ([aff9ebc](https://github.com/awslabs/fhir-works-on-aws-routing/commit/aff9ebc2a3c15b37fe618a7605635a35564decc7))

### [5.2.1](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.2.0...v5.2.1) (2021-05-04)


### Bug Fixes

* bad substitution in absolute URL refs that match the server url ([#75](https://github.com/awslabs/fhir-works-on-aws-routing/issues/75)) ([9974257](https://github.com/awslabs/fhir-works-on-aws-routing/commit/99742570c8c19d6c730db0ae375bd112f42e4f42))
* handle POST bundle with no fullUrl and relative refs ([#74](https://github.com/awslabs/fhir-works-on-aws-routing/issues/74)) ([1d09f48](https://github.com/awslabs/fhir-works-on-aws-routing/commit/1d09f488307b5b0a447738105815e95be76c2a62))

### [5.2.0](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.2.0...v5.1.1) (2021-04-15)

* feat: Add Post method for search ([#70](https://github.com/awslabs/fhir-works-on-aws-routing/pull/70))([0c29a2d](https://github.com/awslabs/fhir-works-on-aws-routing/commit/0c29a2dc9eab953dd64c5cfb18acc48684ce2a71))

### [5.1.1](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.1.0...v5.1.1) (2021-03-29)

## [5.1.0](https://github.com/awslabs/fhir-works-on-aws-routing/compare/v5.0.0...v5.1.0) (2021-03-29)

### Features

* add Implementation Guides support ([#66](https://github.com/awslabs/fhir-works-on-aws-routing/issues/66)) ([151228c](https://github.com/awslabs/fhir-works-on-aws-routing/commit/151228c135ac24a25d95b5f5bde2f4bd735b16af)), closes [#59](https://github.com/awslabs/fhir-works-on-aws-routing/issues/59) [#63](https://github.com/awslabs/fhir-works-on-aws-routing/issues/63)


### Bug Fixes

* Capability Statement rest security value set url ([#61](https://github.com/awslabs/fhir-works-on-aws-routing/issues/61)) ([a68a872](https://github.com/awslabs/fhir-works-on-aws-routing/commit/a68a87246c65a8b10da868ba47bd88e3e73b4004))
* Capability statement to pull updateCreateSupported from Persistence ([#58](https://github.com/awslabs/fhir-works-on-aws-routing/issues/58)) ([bfb9a1d](https://github.com/awslabs/fhir-works-on-aws-routing/commit/bfb9a1db3c4705857d0d45afcb0b69eb5d785e85))
* fix stu3 schema for Bundle & AllergyIntolerance ([#65](https://github.com/awslabs/fhir-works-on-aws-routing/issues/65)) ([87857d1](https://github.com/awslabs/fhir-works-on-aws-routing/commit/87857d19c2bbed9e58bf1a042a5c88c3739eb7db))
* for operations returning GenericResponse type, check that response exists before testing for sub properties. ([#54](https://github.com/awslabs/fhir-works-on-aws-routing/issues/54)) ([e1740b5](https://github.com/awslabs/fhir-works-on-aws-routing/commit/e1740b5dfa2abb75b51a43dc0c8c30e5d42ab44b))
* Relax validation rules before a patch can be applied ([#64](https://github.com/awslabs/fhir-works-on-aws-routing/issues/64)) ([5a87d2b](https://github.com/awslabs/fhir-works-on-aws-routing/commit/5a87d2bc11615392d1535ce029db61bc3cd9d17f))

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
