import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingStateService } from '../../core/services/booking-state.service';
import { Flight } from '../../core/models/flight.model';
import { TravellerDetails } from '../../core/models/traveller.model';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  booking: any = null;
  flight: Flight | null = null;
  traveller: TravellerDetails | null = null;

  constructor(
    private bookingState: BookingStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.booking = this.bookingState.getInitiatedBooking();
    this.flight = this.bookingState.getSelectedFlight();
    this.traveller = this.bookingState.getTraveller();
    if (!this.booking) {
      this.router.navigate(['/search']);
    }
  }

  bookAnother(): void {
    this.bookingState.clear();
    this.router.navigate(['/search']);
  }
}
