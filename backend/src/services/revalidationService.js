'use strict';

const { getCachedEntry, normalizeSupplierFlight } = require('./flightSearchService');
const { getAdapter } = require('../suppliers/supplierGateway');
const { calculatePricing } = require('./pricingEngine');

async function revalidateFare(tixxgoResultId) {
  const entry = getCachedEntry(tixxgoResultId);
  const { supplier, supplierResultId, originalCustomerTotal } = entry;

  const adapter = getAdapter(supplier);
  const revalidatedFlight = await adapter.revalidateFare(supplierResultId, entry.supplierRaw);

  const newPricing = calculatePricing(revalidatedFlight);
  const newTotal = newPricing.customerTotal;
  const priceDiff = newTotal - originalCustomerTotal;
  const status = priceDiff === 0 ? 'PRICE_UNCHANGED' : 'PRICE_CHANGED';

  const flightDetails = normalizeSupplierFlight(revalidatedFlight);

  return {
    tixxgoResultId,
    status,
    originalTotal: originalCustomerTotal,
    newTotal,
    priceDiff,
    pricing: newPricing,
    flightDetails,
  };
}

module.exports = { revalidateFare };
