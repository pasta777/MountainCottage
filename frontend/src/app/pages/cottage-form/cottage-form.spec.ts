import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CottageForm } from './cottage-form';

describe('CottageForm', () => {
  let component: CottageForm;
  let fixture: ComponentFixture<CottageForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CottageForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CottageForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
