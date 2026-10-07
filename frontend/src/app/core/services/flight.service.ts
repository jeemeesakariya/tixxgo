import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Flight, FlightSearchParams, RevalidationResult } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchFlights(params: FlightSearchParams): Observable<Flight[]> {
    return this.http
      .post<{ success: boolean; count: number; flights: Flight[] }>(`${this.baseUrl}/api/flights/search`, params)
      .pipe(map((res) => res.flights));
  }

  revalidateFare(tixxgoResultId: string): Observable<RevalidationResult> {
    return this.http
      .post<RevalidationResult>(`${this.baseUrl}/api/flights/revalidate`, { tixxgoResultId })
      .pipe(map((res) => res));
  }
}
