'use strict';

function calculatePricing(supplierFlight) {
  const { baseFare, taxes } = supplierFlight;
  const serviceFee = 299;
  const discount = 200;
  const supplierCost = baseFare + taxes;
  const customerTotal = baseFare + taxes + serviceFee - discount;

  return {
    supplierCost,
    baseFare,
    taxes,
    serviceFee,
    discount,
    customerTotal,
  };
}

module.exports = { calculatePricing };
