'use strict';

class SupplierAdapter {
  async searchFlights(params) {
    throw new Error('not implemented');
  }

  async revalidateFare(supplierResultId, params) {
    throw new Error('not implemented');
  }

  async bookFlight(bookingData) {
    throw new Error('not implemented');
  }

  async cancelBooking(supplierRef) {
    throw new Error('not implemented');
  }

  async checkBookingStatus(supplierRef) {
    throw new Error('not implemented');
  }
}

module.exports = SupplierAdapter;
