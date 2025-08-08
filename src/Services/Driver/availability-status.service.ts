import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityStatusService {
  private availabilityStatusSubject = new BehaviorSubject<string>('Available');
  availabilityStatus$ = this.availabilityStatusSubject.asObservable();

  setAvailability(status: string) {
    this.availabilityStatusSubject.next(status);
  }

  getAvailability(): string {
    return this.availabilityStatusSubject.getValue();
  }
}
