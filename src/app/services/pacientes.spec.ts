import { TestBed } from '@angular/core/testing';

import { pacientesService } from './pacientes';

describe('Pacientes', () => {
  let service: pacientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(pacientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
