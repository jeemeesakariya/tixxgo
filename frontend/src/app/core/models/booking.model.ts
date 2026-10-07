import { TravellerDetails } from './traveller.model';

export interface BookingInitiateRequest {
  tixxgoResultId: string;
  traveller: TravellerDetails;
  idempotencyKey: string;
}

export interface Booking {
  id: number;
  tixxgoRef: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  baggage: string;
  refundable: boolean;
  customerTotal: number;
  paymentStatus: string;
  bookingStatus: string;
  ticketingStatus: string;
  createdAt: string;
}
