import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Flight } from '../../../core/models/flight.model';
import { BookingStateService } from '../../../core/services/booking-state.service';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss']
})
export class FlightCardComponent {
  @Input() flight!: Flight;
  @Output() selected = new EventEmitter<Flight>();

  expanded = false;

  constructor(
    private bookingState: BookingStateService,
    private router: Router
  ) {}

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  selectFlight(): void {
    this.bookingState.setSelectedFlight(this.flight);
    this.selected.emit(this.flight);
    this.router.navigate(['/revalidation']);
  }
}
