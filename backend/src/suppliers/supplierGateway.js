'use strict';

const TBOAdapter = require('./tbo/tboAdapter');

const adapters = {
  TBO: new TBOAdapter(),
};

function getAdapter(supplierName) {
  const adapter = adapters[supplierName];
  if (!adapter) {
    throw new Error(`No adapter registered for supplier: ${supplierName}`);
  }
  return adapter;
}

module.exports = { getAdapter };
