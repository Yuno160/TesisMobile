import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class HomePage implements OnInit {
  loginForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    // Si ya está logueado, mandarlo adentro
    if (this.authService.currentUserValue) {
      this.router.navigate(['/dashboard']); 
    }

    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {}

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