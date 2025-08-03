import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCottages } from './my-cottages';

describe('MyCottages', () => {
  let component: MyCottages;
  let fixture: ComponentFixture<MyCottages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyCottages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyCottages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
