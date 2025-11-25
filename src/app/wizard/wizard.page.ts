import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpertoService } from '../services/experto-service';
import { LoadingController, ToastController } from '@ionic/angular';

import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
  IonButton, IonIcon, IonProgressBar, IonFooter 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.page.html',
  styleUrls: ['./wizard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
    IonButton, IonIcon, IonProgressBar, IonFooter
  ]})
export class WizardPage implements OnInit {

  categoriaPadre: string = '';
  idPaciente: number | null = null;
  
  listaPreguntas: any[] = [];
  indicePreguntaActual: number = 0;
  
  // Almacenamos las respuestas
  respuestasUsuario: any[] = [];

  loading = true;
  enviando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private expertoService: ExpertoService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    // Recibimos el ID del paciente y la categoría a evaluar (ej: b1, d4, etc.)
    this.idPaciente = Number(this.route.snapshot.paramMap.get('idPaciente'));
    this.categoriaPadre = this.route.snapshot.paramMap.get('categoria') || 'b1'; // Default b1
    
    this.cargarPreguntas();
  }

  async cargarPreguntas() {
    const loader = await this.loadingController.create({ message: 'Cargando Asistente...' });
    await loader.present();

    this.expertoService.getPreguntas(this.categoriaPadre).subscribe({
      next: (data) => {
        this.listaPreguntas = data;
        this.loading = false;
        loader.dismiss();
      },
      error: (err) => {
        console.error(err);
        loader.dismiss();
        this.mostrarToast('Error al cargar preguntas');
      }
    });
  }

  responder(valorRespuesta: string) {
    const preguntaActual = this.listaPreguntas[this.indicePreguntaActual];
    
    // Guardamos la respuesta
    this.respuestasUsuario.push({
      pregunta_id: preguntaActual.id,
      respuesta: valorRespuesta
    });

    // Avanzamos a la siguiente
    if (this.indicePreguntaActual < this.listaPreguntas.length - 1) {
      this.indicePreguntaActual++;
    } else {
      // Se acabaron las preguntas, procesamos
      this.finalizarWizard();
    }
  }

  async finalizarWizard() {
    this.enviando = true;
    const loader = await this.loadingController.create({ message: 'El Sistema Experto está pensando...' });
    await loader.present();

    this.expertoService.evaluarRespuestas(this.respuestasUsuario).subscribe({
      next: (codigosSugeridos) => {
        loader.dismiss();
        console.log('🧠 El experto sugiere:', codigosSugeridos);
        
        // AQUÍ LA MAGIA:
        // Navegamos a la pantalla de Evaluación (la que hicimos antes)
        // pero le pasamos los códigos sugeridos para que se pre-carguen.
        // Usaremos NavigationExtras para pasar el objeto complejo.
        
        this.router.navigate(['/evaluacion', this.idPaciente], { 
          queryParams: { 
            sugerencias: JSON.stringify(codigosSugeridos) 
          }
        });
      },
      error: (err) => {
        loader.dismiss();
        console.error(err);
        this.mostrarToast('Error al procesar respuestas');
        this.enviando = false;
      }
    });
  }

  get progreso() {
    if (this.listaPreguntas.length === 0) return 0;
    return (this.indicePreguntaActual / this.listaPreguntas.length);
  }

  async mostrarToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg, duration: 2000
    });
    toast.present();
  }
}