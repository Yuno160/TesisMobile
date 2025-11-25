// ... imports anteriores
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluacionService } from '../services/evaluacion';

// Imports Standalone (Igual que antes)
import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonSegment, IonSegmentButton, IonLabel, IonList, IonListHeader, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonRange, 
  IonIcon, IonFab, IonFabButton, AlertController, LoadingController, ToastController,
  IonTextarea, IonItem
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { personCircleOutline, happyOutline, sadOutline, checkmarkDoneOutline, saveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.page.html',
  styleUrls: ['./evaluacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonSegment, IonSegmentButton, IonLabel, IonList, IonListHeader, IonCard, 
    IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonRange, 
    IonIcon, IonFab, IonFabButton, IonTextarea, IonItem
  ]
})
export class EvaluacionPage implements OnInit {

  idPaciente: number | null = null;
  segmentoActual: string = 'b'; 
  arbolCompleto: any[] = [];
  itemsVisibles: any[] = [];
  
  calificaciones: { [codigo: string]: number } = {};
  observaciones: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evaluacionService: EvaluacionService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ personCircleOutline, happyOutline, sadOutline, checkmarkDoneOutline, saveOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idPaciente = Number(id);
      this.cargarCodigosCIF();

      this.route.queryParams.subscribe(params => {
        if (params['sugerencias']) {
          const sugerencias = JSON.parse(params['sugerencias']);
          console.log('✨ Aplicando sugerencias del Experto:', sugerencias);
          this.aplicarSugerencias(sugerencias);
        }
      });
    }
  }

  aplicarSugerencias(sugerencias: any[]) {
    sugerencias.forEach(sug => {
      const partes = sug.codigo.split('.');
      if (partes.length === 2) {
        const codigoBase = partes[0];
        const valor = Number(partes[1]);
        this.calificaciones[codigoBase] = valor;
      }
    });
    this.mostrarToast('Sugerencias aplicadas. Revisa y guarda.');
  }

  async cargarCodigosCIF() {
    const loading = await this.loadingController.create({ message: 'Cargando CIF...' });
    await loading.present();

    this.evaluacionService.obtenerArbolCIF().subscribe({
      next: (data) => {
        loading.dismiss();
        this.arbolCompleto = data;
        this.filtrarItemsPorSegmento();
      },
      error: (err) => {
        loading.dismiss();
        console.error(err);
        this.mostrarToast('Error al cargar códigos CIF');
      }
    });
  }
  
  segmentChanged(event: any) {
    this.segmentoActual = event.detail.value;
    this.filtrarItemsPorSegmento();
  }

  filtrarItemsPorSegmento() {
    const rama = this.arbolCompleto.find(nodo => nodo.codigo.toLowerCase() === this.segmentoActual);
    if (rama && rama.children) {
      this.itemsVisibles = rama.children;
    } else {
      this.itemsVisibles = [];
    }
  }

  getTituloSegmento() {
    switch(this.segmentoActual) {
      case 'b': return 'Funciones Corporales (b)';
      case 's': return 'Estructuras Corporales (s)';
      case 'd': return 'Actividades y Part. (d)';
      case 'e': return 'Factores Ambientales (e)';
      default: return '';
    }
  }

  registrarValor(codigo: string, evento: any) {
    const valor = evento.detail.value;
    if (valor > 0) {
      this.calificaciones[codigo] = valor;
    } else {
      delete this.calificaciones[codigo];
    }
  }

  async confirmarGuardado() {
    const codigosGenerados = this.generarArrayCodigos();
    
    if (codigosGenerados.length === 0) {
      this.mostrarToast('Debes calificar al menos un ítem.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Finalizar Evaluación',
      message: `Se guardarán <strong>${codigosGenerados.length}</strong> calificaciones.<br><br>Códigos: ${codigosGenerados.join(', ')}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'GUARDAR',
          role: 'confirm',
          handler: () => {
            this.enviarAlBackend(codigosGenerados);
          }
        }
      ]
    });
    await alert.present();
  }

  generarArrayCodigos(): string[] {
    return Object.keys(this.calificaciones).map(codigo => {
      const valor = this.calificaciones[codigo];
      return `${codigo}.${valor}`;
    });
  }

  async enviarAlBackend(codigos: string[]) {
    const loading = await this.loadingController.create({ message: 'Guardando en BD...' });
    await loading.present();

    const payload = {
      id_paciente: this.idPaciente!,
      observaciones: this.observaciones || 'Evaluación desde App Móvil',
      codigos: codigos
    };

    this.evaluacionService.guardarCalificacion(payload).subscribe({
      next: async (resp: any) => {
        loading.dismiss();
        console.log('✅ Respuesta Backend:', resp);

        // --- MOSTRAR CÓDIGOS FINALES ---
        const codigosGuardados = resp.data?.codigos_guardados || codigos;
        
        const successAlert = await this.alertController.create({
          header: '¡Evaluación Exitosa!',
          subHeader: 'Datos guardados correctamente',
          message: 'Se ha generado el registro para el paciente.\n\nCódigos:\n' + codigosGuardados.join(', '),
          buttons: [{
            text: 'Volver a Pacientes',
            handler: () => {
              this.router.navigate(['/pacientes']);
            }
          }]
        });
        await successAlert.present();
      },
      error: async (err) => {
        loading.dismiss();
        console.error('❌ Error:', err);
        
        const errorAlert = await this.alertController.create({
          header: 'Error al Guardar',
          message: 'Hubo un problema comunicando con el servidor. ' + (err.error?.message || err.message),
          buttons: ['OK']
        });
        await errorAlert.present();
      }
    });
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg, duration: 2000, position: 'bottom'
    });
    toast.present();
  }
}