import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerReservations } from './owner-reservations';

describe('OwnerReservations', () => {
  let component: OwnerReservations;
  let fixture: ComponentFixture<OwnerReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerReservations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerReservations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
