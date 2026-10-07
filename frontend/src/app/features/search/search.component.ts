import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { FlightSearchParams } from '../../core/models/flight.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchForm!: FormGroup;
  loading = false;
  errorMessage = '';
  cabinClasses = ['ECONOMY', 'BUSINESS'];

  constructor(
    private fb: FormBuilder,
    private flightService: FlightService,
    private bookingState: BookingStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookingState.clear();
    this.searchForm = this.fb.group({
      origin: ['AMD', [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern(/^[A-Z]{3}$/)]],
      destination: ['DEL', [Validators.required, Validators.minLength(3), Validators.maxLength(3), Validators.pattern(/^[A-Z]{3}$/)]],
      departureDate: ['2026-10-15', [Validators.required]],
      adults: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
      cabinClass: ['ECONOMY', [Validators.required]]
    });
  }

  get f() {
    return this.searchForm.controls;
  }

  onOriginInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.searchForm.patchValue({ origin: upper }, { emitEvent: false });
    input.value = upper;
  }

  onDestinationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.searchForm.patchValue({ destination: upper }, { emitEvent: false });
    input.value = upper;
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    const params: FlightSearchParams = this.searchForm.value;
    this.flightService.searchFlights(params).subscribe({
      next: (flights) => {
        this.loading = false;
        this.router.navigate(['/results'], { state: { flights, searchParams: params } });
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      }
    });
  }
}
