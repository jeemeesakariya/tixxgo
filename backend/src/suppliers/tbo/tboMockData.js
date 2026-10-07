'use strict';

const STATIC_FLIGHTS = [
  {
    supplier: 'TBO',
    supplierResultId: 'TBO001',
    airline: 'AI',
    flightNumber: 'AI482',
    origin: 'AMD',
    destination: 'DEL',
    baseFare: 5200,
    taxes: 950,
    baggage: '15 KG',
    refundable: true,
    departureTime: '10:30:00',
    arrivalTime: '12:10:00'
  },
  {
    supplier: 'TBO',
    supplierResultId: 'TBO002',
    airline: '6E',
    flightNumber: '6E234',
    origin: 'AMD',
    destination: 'DEL',
    baseFare: 4800,
    taxes: 850,
    baggage: '15 KG',
    refundable: false,
    departureTime: '14:00:00',
    arrivalTime: '15:40:00'
  },
  {
    supplier: 'TBO',
    supplierResultId: 'TBO003',
    airline: 'SG',
    flightNumber: 'SG101',
    origin: 'AMD',
    destination: 'DEL',
    baseFare: 4500,
    taxes: 800,
    baggage: '20 KG',
    refundable: true,
    departureTime: '18:00:00',
    arrivalTime: '19:45:00'
  },
  {
    supplier: 'TBO',
    supplierResultId: 'TBO004',
    airline: 'UK',
    flightNumber: 'UK994',
    origin: 'DEL',
    destination: 'BOM',
    baseFare: 6500,
    taxes: 1100,
    baggage: '15 KG',
    refundable: true,
    departureTime: '08:00:00',
    arrivalTime: '10:15:00'
  },
  {
    supplier: 'TBO',
    supplierResultId: 'TBO005',
    airline: '6E',
    flightNumber: '6E556',
    origin: 'BOM',
    destination: 'GOI',
    baseFare: 3200,
    taxes: 500,
    baggage: '15 KG',
    refundable: false,
    departureTime: '16:00:00',
    arrivalTime: '17:20:00'
  }
];

function getMockFlights(params) {
  const reqOrigin = params.origin ? params.origin.toUpperCase() : null;
  const reqDest = params.destination ? params.destination.toUpperCase() : null;
  let dateStr = params.departureDate || '2026-10-15';
  if (dateStr instanceof Date) {
    dateStr = dateStr.toISOString().split('T')[0];
  }

  const matchedFlights = STATIC_FLIGHTS.filter(
    (f) => f.origin === reqOrigin && f.destination === reqDest
  );

  return matchedFlights.map((f) => ({
    supplier: f.supplier,
    supplierResultId: f.supplierResultId,
    airline: f.airline,
    flightNumber: f.flightNumber,
    origin: f.origin,
    destination: f.destination,
    departure: `${dateStr}T${f.departureTime}`,
    arrival: `${dateStr}T${f.arrivalTime}`,
    baseFare: f.baseFare,
    taxes: f.taxes,
    baggage: f.baggage,
    refundable: f.refundable
  }));
}

module.exports = { getMockFlights };
