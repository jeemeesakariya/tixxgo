import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Flight } from '../../core/models/flight.model';
import { FlightCardComponent } from './flight-card/flight-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FlightCardComponent, LoadingSpinnerComponent],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  flights: Flight[] = [];
  loading = true;
  searchParams: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state as { flights: Flight[]; searchParams: any };
    if (!state?.flights) {
      this.router.navigate(['/search']);
      return;
    }
    this.flights = state.flights;
    this.searchParams = state.searchParams;
    this.loading = false;
  }

  goBack(): void {
    this.router.navigate(['/search']);
  }
}
