import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { RevalidationResult } from '../../core/models/flight.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-revalidation',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './revalidation.component.html',
  styleUrls: ['./revalidation.component.scss']
})
export class RevalidationComponent implements OnInit {
  loading = true;
  errorMessage = '';
  result: RevalidationResult | null = null;

  constructor(
    private flightService: FlightService,
    private bookingState: BookingStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const flight = this.bookingState.getSelectedFlight();
    if (!flight) {
      this.router.navigate(['/search']);
      return;
    }
    this.flightService.revalidateFare(flight.tixxgoResultId).subscribe({
      next: (result) => {
        this.loading = false;
        this.result = result;
        this.bookingState.setRevalidationResult(result);
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      }
    });
  }

  proceed(): void {
    this.router.navigate(['/traveller']);
  }

  cancel(): void {
    this.router.navigate(['/results']);
  }
}
