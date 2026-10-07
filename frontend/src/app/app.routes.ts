import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "search", pathMatch: "full" },
  {
    path: "search",
    loadComponent: () =>
      import("./features/search/search.component").then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: "results",
    loadComponent: () =>
      import("./features/results/results.component").then(
        (m) => m.ResultsComponent,
      ),
  },
  {
    path: "revalidation",
    loadComponent: () =>
      import("./features/revalidation/revalidation.component").then(
        (m) => m.RevalidationComponent,
      ),
  },
  {
    path: "traveller",
    loadComponent: () =>
      import("./features/traveller/traveller.component").then(
        (m) => m.TravellerComponent,
      ),
  },
  {
    path: "payment",
    loadComponent: () =>
      import("./features/payment/payment.component").then(
        (m) => m.PaymentComponent,
      ),
  },
  {
    path: "confirmation",
    loadComponent: () =>
      import("./features/confirmation/confirmation.component").then(
        (m) => m.ConfirmationComponent,
      ),
  },
  { path: "**", redirectTo: "search" },
];
