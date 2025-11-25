import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluacionPage } from './evaluacion.page';

describe('EvaluacionPage', () => {
  let component: EvaluacionPage;
  let fixture: ComponentFixture<EvaluacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
