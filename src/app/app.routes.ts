import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'pacientes',
    loadComponent: () => import('./pacientes/pacientes.page').then( m => m.PacientesPage)
  },
  {
  // Ruta para editar: recibe un ID
  path: 'crear-paciente/:carnet_identidad',
  loadComponent: () => import('./crear-paciente/crear-paciente.page').then( m => m.CrearPacientePage)
},
  {
  path: 'crear-paciente',
  loadComponent: () => import('./crear-paciente/crear-paciente.page').then( m => m.CrearPacientePage)
},

  {
    path: 'evaluacion',
    loadComponent: () => import('./evaluacion/evaluacion.page').then( m => m.EvaluacionPage)
  },
   {
    path: 'evaluacion/:id',
    loadComponent: () => import('./evaluacion/evaluacion.page').then( m => m.EvaluacionPage)
  },
{
  path: 'wizard/:idPaciente/:categoria',
  loadComponent: () => import('./wizard/wizard.page').then( m => m.WizardPage)
},
  {
    path: 'reporte',
    loadComponent: () => import('./reporte/reporte.page').then( m => m.ReportePage)
  },
  {
    path: 'reporte/:id',
    loadComponent: () => import('./reporte/reporte.page').then( m => m.ReportePage)
  },
  
];
