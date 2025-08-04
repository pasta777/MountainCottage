import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCottagesManagement } from './admin-cottages-management';

describe('AdminCottagesManagement', () => {
  let component: AdminCottagesManagement;
  let fixture: ComponentFixture<AdminCottagesManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCottagesManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCottagesManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
