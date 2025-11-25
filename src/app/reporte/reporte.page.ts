import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { pacientesService } from '../services/pacientes';
import { EvaluacionService } from '../services/evaluacion';
import { LoadingController, ToastController } from '@ionic/angular';

// Imports Standalone
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
  IonList, IonItem, IonLabel, IonBadge, IonIcon, IonGrid, IonRow, IonCol,
  IonNote
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { documentTextOutline, calendarOutline, personOutline, medkitOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.page.html',
  styleUrls: ['./reporte.page.scss'],
  standalone: true,
   imports: [
    CommonModule, 
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
    IonList, IonItem, IonLabel, IonBadge, IonIcon, IonGrid, IonRow, IonCol,
    IonNote
  ]
})
export class ReportePage implements OnInit {

  idPaciente: number | null = null;
  paciente: any = null;
  evaluacion: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private pacientesService: pacientesService,
    private evaluacionService: EvaluacionService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ documentTextOutline, calendarOutline, personOutline, medkitOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idPaciente = Number(id);
      this.cargarDatosCompletos();
    }
  }

  async cargarDatosCompletos() {
    const loader = await this.loadingController.create({ message: 'Generando reporte...' });
    await loader.present();

    if (!this.idPaciente) return;

    // Cargamos Paciente y Evaluación en paralelo
    // (Es un truco sucio pero rápido: una promesa dentro de otra suscripción)
    
    this.pacientesService.getPacienteById(this.idPaciente).subscribe({
      next: (dataPac) => {
        // 1. Tenemos los datos personales
        // Si es un array, tomamos el primero
        this.paciente = Array.isArray(dataPac) ? dataPac[0] : dataPac;
        
        // 2. Ahora pedimos la evaluación
        this.evaluacionService.obtenerCalificacionPorPaciente(this.idPaciente!).subscribe({
          next: (dataEval) => {
            this.evaluacion = dataEval;
            this.loading = false;
            loader.dismiss();
          },
          error: (err) => {
            console.error('Error evaluacion:', err);
            this.loading = false;
            loader.dismiss();
            // Si es 404 es que no tiene eval, pero se supone que solo entramos aquí si ya tiene.
          }
        });
      },
      error: (err) => {
        console.error('Error paciente:', err);
        this.loading = false;
        loader.dismiss();
        this.mostrarToast('Error al cargar datos del paciente');
      }
    });
  }

  getColorPorValor(valor: any): string {
    // Convertimos a número por si acaso viene como string "2"
    const v = Number(valor);
    if (v === 0) return 'success'; // Ninguno (Verde)
    if (v === 1) return 'warning'; // Ligero (Amarillo)
    if (v === 2) return 'warning'; // Moderado (Naranja/Amarillo oscuro)
    if (v === 3) return 'danger';  // Grave (Rojo)
    if (v === 4) return 'danger';  // Completo (Rojo oscuro)
    return 'medium';
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastController.create({ message: msg, duration: 2000 });
    toast.present();
  }
}