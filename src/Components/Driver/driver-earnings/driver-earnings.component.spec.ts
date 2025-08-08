import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverEarningsComponent } from './driver-earnings.component';

describe('DriverEarningsComponent', () => {
  let component: DriverEarningsComponent;
  let fixture: ComponentFixture<DriverEarningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverEarningsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverEarningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
