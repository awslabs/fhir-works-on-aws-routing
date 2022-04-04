/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export const MAX_BUNDLE_ENTRIES = 25;
// Lambda payload limit is 6MB, assuming an average request of 4KB,
// we have 6MB / 4Kb = 1500. Dividing by half to allow for contingencies, we have the following limit:
export const MAX_BATCH_ENTRIES = 750;
