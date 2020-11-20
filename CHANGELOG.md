# Changelog

All notable changes to this project will be documented in this file.

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
