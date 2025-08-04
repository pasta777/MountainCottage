import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CottageDetails } from './cottage-details';

describe('CottageDetails', () => {
  let component: CottageDetails;
  let fixture: ComponentFixture<CottageDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CottageDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CottageDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
