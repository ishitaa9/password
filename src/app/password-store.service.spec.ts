import { TestBed } from '@angular/core/testing';

import { PasswordStoreService } from './password-store.service';

describe('PasswordStoreService', () => {
  let service: PasswordStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
