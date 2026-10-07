import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookingInitiateRequest } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  initiateBooking(data: BookingInitiateRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/bookings/initiate`, data);
  }

  confirmBooking(bookingId: number, acceptPriceChange: boolean): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/bookings/${bookingId}/confirm`, { acceptPriceChange });
  }

  getBooking(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/bookings/${bookingId}`);
  }

  getCancellationPreview(bookingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/bookings/${bookingId}/cancel/preview`, {});
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/bookings/${bookingId}/cancel`, {});
  }
}
