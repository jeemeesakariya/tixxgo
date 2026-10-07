import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Flight, RevalidationResult } from '../models/flight.model';
import { TravellerDetails } from '../models/traveller.model';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private selectedFlightSubject = new BehaviorSubject<Flight | null>(null);
  private revalidationResultSubject = new BehaviorSubject<RevalidationResult | null>(null);
  private initiatedBookingSubject = new BehaviorSubject<any | null>(null);
  private travellerSubject = new BehaviorSubject<TravellerDetails | null>(null);

  selectedFlight$ = this.selectedFlightSubject.asObservable();
  revalidationResult$ = this.revalidationResultSubject.asObservable();
  initiatedBooking$ = this.initiatedBookingSubject.asObservable();
  traveller$ = this.travellerSubject.asObservable();

  setSelectedFlight(flight: Flight): void {
    this.selectedFlightSubject.next(flight);
  }

  setRevalidationResult(result: RevalidationResult): void {
    this.revalidationResultSubject.next(result);
  }

  setInitiatedBooking(booking: any): void {
    this.initiatedBookingSubject.next(booking);
  }

  setTraveller(traveller: TravellerDetails): void {
    this.travellerSubject.next(traveller);
  }

  getSelectedFlight(): Flight | null {
    return this.selectedFlightSubject.getValue();
  }

  getRevalidationResult(): RevalidationResult | null {
    return this.revalidationResultSubject.getValue();
  }

  getInitiatedBooking(): any | null {
    return this.initiatedBookingSubject.getValue();
  }

  getTraveller(): TravellerDetails | null {
    return this.travellerSubject.getValue();
  }

  clear(): void {
    this.selectedFlightSubject.next(null);
    this.revalidationResultSubject.next(null);
    this.initiatedBookingSubject.next(null);
    this.travellerSubject.next(null);
  }
}
