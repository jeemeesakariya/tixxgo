import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { Flight } from '../../core/models/flight.model';
import { TravellerDetails } from '../../core/models/traveller.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  flight: Flight | null = null;
  traveller: TravellerDetails | null = null;
  initiatedBooking: any = null;
  processing = false;
  errorMessage = '';

  constructor(
    private bookingService: BookingService,
    private bookingState: BookingStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.flight = this.bookingState.getSelectedFlight();
    this.traveller = this.bookingState.getTraveller();
    this.initiatedBooking = this.bookingState.getInitiatedBooking();
    if (!this.initiatedBooking) {
      this.router.navigate(['/search']);
    }
  }

  get totalAmount(): number {
    return this.initiatedBooking?.booking?.customer_total
      ?? this.initiatedBooking?.customer_total
      ?? this.flight?.pricing.customerTotal
      ?? 0;
  }

  get bookingId(): number {
    return this.initiatedBooking?.booking?.id ?? this.initiatedBooking?.id;
  }

  get acceptPriceChange(): boolean {
    return !!this.initiatedBooking?.requiresAcceptance;
  }

  pay(): void {
    this.processing = true;
    this.errorMessage = '';
    this.bookingService.confirmBooking(this.bookingId, true).subscribe({
      next: (response) => {
        this.processing = false;
        this.bookingState.setInitiatedBooking(response?.booking ?? response);
        this.router.navigate(['/confirmation']);
      },
      error: (err: Error) => {
        this.processing = false;
        this.errorMessage = err.message;
      }
    });
  }
}
