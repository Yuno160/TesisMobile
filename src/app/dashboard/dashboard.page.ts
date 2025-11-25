import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DashboardPage implements OnInit {
  
  nombreUsuario: string = '';
  rolUsuario: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Obtenemos los datos del usuario guardado
    const user = this.authService.currentUserValue;
    if (user) {
      this.nombreUsuario = user.usuario.nombre;
      this.rolUsuario = user.usuario.rol;
    }
  }

  logout() {
    this.authService.logout();
    // La redirección al login ya la hace el servicio, pero por seguridad:
    this.router.navigate(['/home']);
  }
  
 irAEvaluacion() {
  this.router.navigate(['/pacientes']);
}

}