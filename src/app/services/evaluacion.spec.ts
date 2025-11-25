import { TestBed } from '@angular/core/testing';

import { EvaluacionService } from './evaluacion';

describe('Evaluacion', () => {
  let service: EvaluacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
