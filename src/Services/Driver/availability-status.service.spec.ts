import { TestBed } from '@angular/core/testing';

import { AvailabilityStatusService } from './availability-status.service';

describe('AvailabilityStatusService', () => {
  let service: AvailabilityStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvailabilityStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
