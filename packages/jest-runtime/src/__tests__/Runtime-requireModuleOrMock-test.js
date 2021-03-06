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

let createRuntime;

const moduleNameMapper = {
  '^image![a-zA-Z0-9$_-]+$': 'GlobalImageStub',
  '^[./a-zA-Z0-9$_-]+\.png$': 'RelativeImageStub',
  'mappedToPath': '<rootDir>/GlobalImageStub.js',
  'mappedToDirectory': '<rootDir>/MyDirectoryModule',
  'module/name/(.*)': '<rootDir>/mapped_module_$1.js',
};

beforeEach(() => {
  createRuntime = require('createRuntime');
});

it('mocks modules by default', () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'RegularModule',
    );
    expect(exports.setModuleStateValue._isMockFunction).toBe(true);
  }),
);

it(`doesn't mock modules when explicitly unmocked`, () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    const root = runtime.requireModule(runtime.__mockRootPath);
    root.jest.unmock('RegularModule');
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'RegularModule',
    );
    expect(exports.isRealModule).toBe(true);
  }),
);

it(`doesn't mock modules when explicitly unmocked via a different denormalized module name`, () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    const root = runtime.requireModule(runtime.__mockRootPath);
    root.jest.unmock('./RegularModule');
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'RegularModule',
    );
    expect(exports.isRealModule).toBe(true);
  }),
);

it(`doesn't mock modules when disableAutomock() has been called`, () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    const root = runtime.requireModule(runtime.__mockRootPath);
    root.jest.disableAutomock();
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'RegularModule',
    );
    expect(exports.isRealModule).toBe(true);
  }),
);

it('uses manual mock when automocking on and mock is avail', () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'ManuallyMocked',
    );
    expect(exports.isManualMockModule).toBe(true);
  }),
);

it('does not use manual mock when automocking is off and a real module is available', () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    const root = runtime.requireModule(runtime.__mockRootPath);
    root.jest.disableAutomock();
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'ManuallyMocked',
    );
    expect(exports.isManualMockModule).toBe(false);
  }),
);

it('resolves mapped module names and unmocks them by default', () =>
  createRuntime(__filename, {moduleNameMapper}).then(runtime => {
    let exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'image!not-really-a-module',
    );
    expect(exports.isGlobalImageStub).toBe(true);

    exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'mappedToPath',
    );
    expect(exports.isGlobalImageStub).toBe(true);

    exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'mappedToDirectory',
    );
    expect(exports.isIndex).toBe(true);

    exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'cat.png',
    );
    expect(exports.isRelativeImageStub).toBe(true);

    exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      '../photos/dog.png',
    );
    expect(exports.isRelativeImageStub).toBe(true);

    exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'module/name/test',
    );
    expect(exports).toBe('mapped_module');
  }),
);

it('automocking be disabled by default', () =>
  createRuntime(__filename, {
    moduleNameMapper,
    automock: false,
  }).then(runtime => {
    const exports = runtime.requireModuleOrMock(
      runtime.__mockRootPath,
      'RegularModule',
    );
    expect(exports.setModuleStateValue._isMockFunction).toBe(undefined);
  }),
);
