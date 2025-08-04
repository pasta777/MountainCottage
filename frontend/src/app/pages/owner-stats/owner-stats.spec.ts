import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerStats } from './owner-stats';

describe('OwnerStats', () => {
  let component: OwnerStats;
  let fixture: ComponentFixture<OwnerStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
