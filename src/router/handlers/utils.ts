/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

import { createHash } from 'crypto';
import * as xss from 'xss';

const options = {
    whiteList: {
        ...xss.whiteList,
        div: ['xmlns'],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
    onTagAttr: function (tag: string, name: string, value: string, isWhiteAttr: boolean) {
        if (name === 'xmlns') {
            return `${name}=${value}`;
        }
    }
};
const xssValidator = new xss.FilterXSS(options);

export const hash = (o: any): any => createHash('sha256').update(JSON.stringify(o)).digest('hex');

export const validateXHTMLResource = (resource: any): string => {
    if (process.env.VALIDATE_XHTML === 'true') {
        const originalResource = JSON.stringify(resource);
        const validatedResource = xssValidator.process(originalResource);
        console.log('original', originalResource, 'validated', validatedResource);
        return JSON.parse(validatedResource);
    }
    return resource;
}
