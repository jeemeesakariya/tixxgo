import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { BookingService } from '../../core/services/booking.service';
import { BookingStateService } from '../../core/services/booking-state.service';
import { BookingInitiateRequest } from '../../core/models/booking.model';
import { TravellerDetails } from '../../core/models/traveller.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-traveller',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorBannerComponent],
  templateUrl: './traveller.component.html',
  styleUrls: ['./traveller.component.scss']
})
export class TravellerComponent implements OnInit {
  travellerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  requiresAcceptance = false;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private bookingState: BookingStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const revalidation = this.bookingState.getRevalidationResult();
    if (!revalidation) {
      this.router.navigate(['/search']);
      return;
    }
    this.travellerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      dateOfBirth: ['', [Validators.required]],
      passportNumber: [''],
      nationality: ['']
    });
  }

  get f() {
    return this.travellerForm.controls;
  }

  onSubmit(): void {
    if (this.travellerForm.invalid) {
      this.travellerForm.markAllAsTouched();
      return;
    }
    const revalidation = this.bookingState.getRevalidationResult();
    if (!revalidation) {
      this.router.navigate(['/search']);
      return;
    }
    const traveller: TravellerDetails = this.travellerForm.value;
    this.bookingState.setTraveller(traveller);
    const request: BookingInitiateRequest = {
      tixxgoResultId: revalidation.tixxgoResultId,
      traveller,
      idempotencyKey: uuidv4()
    };
    this.loading = true;
    this.errorMessage = '';
    this.bookingService.initiateBooking(request).subscribe({
      next: (response) => {
        this.loading = false;
        if (response?.requiresAcceptance) {
          this.requiresAcceptance = true;
        }
        this.bookingState.setInitiatedBooking(response);
        this.router.navigate(['/payment']);
      },
      error: (err: Error) => {
        this.loading = false;
        this.errorMessage = err.message;
      }
    });
  }
}
