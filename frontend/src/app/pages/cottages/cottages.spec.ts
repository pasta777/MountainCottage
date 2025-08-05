import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cottages } from './cottages';

describe('Cottages', () => {
  let component: Cottages;
  let fixture: ComponentFixture<Cottages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cottages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cottages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
