export interface FlightPricing {
  baseFare: number;
  taxes: number;
  serviceFee: number;
  discount: number;
  customerTotal: number;
}

export interface Flight {
  tixxgoResultId: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  baggage: string;
  refundable: boolean;
  pricing: FlightPricing;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
  cabinClass: string;
}

export interface RevalidationResult {
  tixxgoResultId: string;
  status: 'PRICE_UNCHANGED' | 'PRICE_CHANGED';
  originalTotal: number;
  newTotal: number;
  priceDiff: number;
  pricing: FlightPricing;
  flightDetails: Flight;
}
