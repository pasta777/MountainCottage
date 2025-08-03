import { TestBed } from '@angular/core/testing';

import { Cottage } from './cottage';

describe('Cottage', () => {
  let service: Cottage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cottage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
