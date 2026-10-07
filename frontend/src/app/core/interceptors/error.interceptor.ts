import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';

function buildErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Unable to reach the server. Please check your connection.';
  }
  if (error.status === 400) {
    return error.error?.message ?? 'Invalid request. Please check your input.';
  }
  if (error.status === 401) {
    return 'You are not authorised to perform this action.';
  }
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }
  if (error.status === 409) {
    return error.error?.message ?? 'A conflict occurred. Please try again.';
  }
  if (error.status >= 500) {
    return 'A server error occurred. Please try again later.';
  }
  return error.error?.message ?? 'An unexpected error occurred.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = buildErrorMessage(error);
      return throwError(() => new Error(message));
    })
  );
};
