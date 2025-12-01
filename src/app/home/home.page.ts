import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonInput, IonButton, IonIcon, 
  ToastController, LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth'; // Asegúrate que la ruta sea correcta
import { Config } from '../services/config'; 

import { addIcons } from 'ionicons';
import { logInOutline, settings } from 'ionicons/icons'; 
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class HomePage implements OnInit {
  loginForm: FormGroup;
  currentIpDisplay: string = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private configService: Config,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController // Inyectamos AlertController
  ) {

    addIcons({ logInOutline, settings });
    // Si ya está logueado, mandarlo adentro
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']); 
    }

    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {this.actualizarIpDisplay();}

  actualizarIpDisplay() {
    // Solo mostramos la parte de la IP para que se vea bonito en el footer
    const rawIp = this.configService.getRawIp();
    this.currentIpDisplay = rawIp ? rawIp : 'Localhost (Default)';
  }
   // --- FUNCIÓN PARA CAMBIAR IP ---
  async abrirConfiguracion() {
    const alert = await this.alertController.create({
      header: 'Configurar Servidor',
      message: 'Ingresa la IP de tu computadora (ej: 192.168.1.15)',
      inputs: [
        {
          name: 'ip',
          type: 'text',
          placeholder: 'Ej: 192.168.X.X',
          value: this.configService.getRawIp() // Pre-llenar con la actual si existe
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.ip) {
              this.configService.saveIp(data.ip);
              this.actualizarIpDisplay();
              this.presentToast('IP actualizada correctamente. Reinicia si es necesario.', 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    // 1. Mostrar Loading visualmente atractivo
    const loading = await this.loadingController.create({
      message: 'Ingresando a SHOG.AI...',
      spinner: 'crescent'
    });
    await loading.present();

    const { usuario, password } = this.loginForm.value;

    this.authService.login(usuario, password).subscribe({
      next: async (data) => {
        await loading.dismiss();
        
        // Toast de éxito
        this.presentToast(`¡Hola de nuevo, ${data.usuario.nombre}!`, 'success');
        
        // Navegar al Dashboard (o Home)
        this.router.navigate(['/dashboard']); // Ajusta esta ruta según lo que tengamos creado
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error login mobile:', error);

        let msg = 'Error de conexión. Revisa tu IP.';
        if (error.status === 401) msg = 'Credenciales incorrectas.';
        if (error.status === 404) msg = 'Usuario inactivo o no existe.';

        this.presentToast(msg, 'danger');
      }
    });
  }

  // Helper para mostrar mensajes
  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}