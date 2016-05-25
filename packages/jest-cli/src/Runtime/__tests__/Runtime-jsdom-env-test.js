/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+jsinfra
 */
'use strict';

jest.disableAutomock();

jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

let createRuntime;

describe('Runtime', () => {
  beforeEach(() => {
    createRuntime = require('createRuntime');
  });

  describe('requireModule', () => {
    pit('emulates a node stack trace during module load', () =>
      createRuntime(__filename).then(runtime => {
        let hasThrown = false;
        try {
          runtime.requireModule(runtime.__mockRootPath, './throwing.js');
        } catch (err) {
          hasThrown = true;
          expect(err.stack).toMatch(/^Error: throwing\s+at Object.<anonymous>/);
        }
        expect(hasThrown).toBe(true);
      })
    );

    pit('emulates a node stack trace during function execution', () =>
      createRuntime(__filename).then(runtime => {
        let hasThrown = false;
        const sum = runtime.requireModule(
          runtime.__mockRootPath,
          './throwing-fn.js'
        );

        try {
          sum();
        } catch (err) {
          hasThrown = true;

          if (process.platform === 'win32') {
            expect(err.stack).toMatch(
              /^Error: throwing fn\s+at sum.+Runtime\\__tests__\\test_root\\throwing-fn.js:12:9/
            );
          } else {
            expect(err.stack).toMatch(
              /^Error: throwing fn\s+at sum.+Runtime\/__tests__\/test_root\/throwing-fn.js:12:9/
            );
          }
        }
        expect(hasThrown).toBe(true);
      })
    );
  });
});