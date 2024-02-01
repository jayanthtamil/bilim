/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall draft_js
 */

'use strict';

const DraftStringKey = {
  stringify(key: ?string): string {
    return '_' + String(key);
  },

  unstringify(key: string): string {
    return key.slice(1);
  },
};

module.exports = DraftStringKey;