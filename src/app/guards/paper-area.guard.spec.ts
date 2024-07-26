import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { paperAreaGuard } from './paper-area.guard';

describe('paperAreaGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => paperAreaGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
