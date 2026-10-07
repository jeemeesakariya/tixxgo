'use strict';

const { v4: uuidv4 } = require('uuid');
const SupplierAdapter = require('../interface/supplierAdapter');
const { getMockFlights } = require('./tboMockData');
const env = require('../../config/env');

class TBOAdapter extends SupplierAdapter {
  async searchFlights(params) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockFlights(params);
  }

  async revalidateFare(supplierResultId, originalFlight) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const flight = originalFlight || getMockFlights({})[0];
    if (!flight) {
      throw new Error(`Supplier result not found: ${supplierResultId}`);
    }
    if (supplierResultId === 'TBO001') {
      return { ...flight, baseFare: 5400 };
    }
    return { ...flight };
  }

  async bookFlight(bookingData) {
    if (env.PAYMENT_MODE === 'TIMEOUT') {
      await new Promise((resolve) => setTimeout(resolve, env.SUPPLIER_TIMEOUT_MS + 1000));
      throw new Error('Supplier booking timeout');
    }
    return {
      success: true,
      supplierPnr: `TBO-PNR-${uuidv4()}`,
    };
  }

  async cancelBooking(supplierRef) {
    return {
      success: true,
      cancellationRef: `TBO-CXL-${uuidv4()}`,
      airlineCharge: 500,
    };
  }

  async checkBookingStatus(supplierRef) {
    return {
      status: 'CONFIRMED',
      supplierPnr: supplierRef,
    };
  }
}

module.exports = TBOAdapter;
