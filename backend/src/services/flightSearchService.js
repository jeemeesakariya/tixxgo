'use strict';

const { v4: uuidv4 } = require('uuid');
const { getAdapter } = require('../suppliers/supplierGateway');
const { calculatePricing } = require('./pricingEngine');

const resultCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;

function pruneExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of resultCache.entries()) {
    if (now - value.createdAt > CACHE_TTL_MS) {
      resultCache.delete(key);
    }
  }
}

function calcDurationMinutes(departure, arrival) {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  return Math.round((arr - dep) / 60000);
}

function normalizeSupplierFlight(supplierFlight) {
  const tixxgoResultId = uuidv4();
  const pricing = calculatePricing(supplierFlight);

  resultCache.set(tixxgoResultId, {
    supplierResultId: supplierFlight.supplierResultId,
    supplier: supplierFlight.supplier,
    supplierRaw: supplierFlight,
    originalCustomerTotal: pricing.customerTotal,
    createdAt: Date.now(),
  });

  return {
    tixxgoResultId,
    flightNumber: supplierFlight.flightNumber,
    airline: supplierFlight.airline,
    origin: supplierFlight.origin,
    destination: supplierFlight.destination,
    departureTime: supplierFlight.departure,
    arrivalTime: supplierFlight.arrival,
    duration: calcDurationMinutes(supplierFlight.departure, supplierFlight.arrival),
    baggage: supplierFlight.baggage,
    refundable: supplierFlight.refundable,
    pricing,
  };
}

async function searchFlights(params) {
  pruneExpiredEntries();
  const supplier = params.supplier || 'TBO';
  const adapter = getAdapter(supplier);
  const supplierResults = await adapter.searchFlights(params);
  return supplierResults.map(normalizeSupplierFlight);
}

function getCachedEntry(tixxgoResultId) {
  const entry = resultCache.get(tixxgoResultId);
  if (!entry) {
    throw new Error(`Result not found or expired: ${tixxgoResultId}`);
  }
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    resultCache.delete(tixxgoResultId);
    throw new Error(`Result expired: ${tixxgoResultId}`);
  }
  return entry;
}

module.exports = { searchFlights, getCachedEntry, normalizeSupplierFlight };
