/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { createHash } from 'crypto';

export const hash = (o: any): string => createHash('sha256').update(JSON.stringify(o)).digest('hex');
