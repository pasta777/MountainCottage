import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserEdit } from './admin-user-edit';

describe('AdminUserEdit', () => {
  let component: AdminUserEdit;
  let fixture: ComponentFixture<AdminUserEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
