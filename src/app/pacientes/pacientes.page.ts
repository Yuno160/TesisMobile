import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// CORRECCIÓN 1: Nombres de clases e imports correctos (Mayúsculas y .service)
import { pacientesService } from '../services/pacientes';
import { AuthService } from '../services/auth';
import { Paciente } from 'src/app/interfaces/patient.interface';

import { 
  IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonSearchbar, 
  IonContent, IonRefresher, IonRefresherContent, IonList, IonItemSliding, 
  IonItem, IonAvatar, IonLabel, IonBadge, IonItemOptions, IonItemOption, 
  IonIcon, IonFab, IonFabButton, IonButton,
  AlertController, ToastController 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { createOutline, trashOutline, peopleOutline, add, colorWandOutline, clipboardOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.page.html',
  styleUrls: ['./pacientes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonSearchbar, 
    IonContent, IonRefresher, IonRefresherContent, IonList, IonItemSliding, 
    IonItem, IonAvatar, IonLabel, IonBadge, IonItemOptions, IonItemOption, 
    IonIcon, IonFab, IonFabButton, IonButton
  ]
})
export class PacientesPage implements OnInit {

  listaPacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  loading = true;

  constructor(
    // CORRECCIÓN 2: Tipo correcto (PacientesService con P mayúscula)
    private pacientesService: pacientesService,
    private authService: AuthService, 
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { 
    addIcons({ createOutline, trashOutline, peopleOutline, add, colorWandOutline, clipboardOutline, logOutOutline });
  }

  ngOnInit() { this.cargarPacientes(); }
  ionViewWillEnter() { this.cargarPacientes(); }

  cargarPacientes(event?: any) {
    this.loading = true;
    this.pacientesService.getPacientes().subscribe({
      next: (resp) => {
        console.log('📋 Lista de pacientes cargada:', resp);
        this.listaPacientes = resp;
        this.pacientesFiltrados = resp;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error('Error cargando pacientes:', err);
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }
  
  filtrarPacientes(event: any) {
    const texto = event.target.value.toLowerCase();
    this.pacientesFiltrados = this.listaPacientes.filter(p => {
      const nombreCompleto = p.nombre.toLowerCase();
      return nombreCompleto.includes(texto) || p.carnet_identidad.includes(texto);
    });
  }

  seleccionarPaciente(paciente: Paciente) {
    if (paciente.ya_calificado) {
      this.router.navigate(['/reporte', paciente.id_paciente]);
    } else {
      this.router.navigate(['/evaluacion', paciente.id_paciente]);
    }
  }

  iniciarAsistente(paciente: Paciente) {
    this.router.navigate(['/wizard', paciente.id_paciente, 'b1']);
    const slidingItem = document.getElementById('sliding-' + paciente.id_paciente) as any;
    if (slidingItem) slidingItem.close();
  }

  editarPaciente(paciente: Paciente) {
    console.log('✏️ Intentando editar paciente:', paciente);
    
    if (!paciente.id_paciente) {
      console.error('🚨 ALERTA: El paciente NO tiene id_paciente.');
      this.presentToast('Error: Identificador de paciente no encontrado');
      return;
    }

    // Aquí usamos ID porque la ruta 'crear-paciente/:id' carga por ID
    this.router.navigate(['/crear-paciente', paciente.id_paciente]);
  }

  async confirmarEliminacion(paciente: Paciente) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Seguro que deseas eliminar a <strong>${paciente.nombre}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            // ESTO ES CORRECTO: Tu backend pide carnet para borrar
            this.eliminarPaciente(paciente.carnet_identidad);
          }
        }
      ]
    });
    await alert.present();
  }

  eliminarPaciente(carnet_identidad: string) {
    this.pacientesService.deletePaciente(carnet_identidad).subscribe({
      next: () => {
        this.presentToast('Paciente eliminado correctamente');
        this.cargarPacientes();
      },
      error: (err) => {
        console.error(err);
        this.presentToast('Error al eliminar paciente');
      }
    });
  }

  crearNuevo() {
    this.router.navigate(['/crear-paciente']);
  }

  logout() {
    this.authService.logout();
  }

  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg, duration: 2000, position: 'bottom'
    });
    toast.present();
  }
}