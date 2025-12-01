import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Config } from '../services/config';

// INTERFAZ: Define qué devuelve tu backend exactamente
export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id: number;
    nombre: string;
    rol: string;
    cargo: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // ⚠️ IMPORTANTE SAKI: Cambia esta IP por la de tu computadora (ipconfig en windows)
  // Si usas emulador de Android Studio, puedes usar 10.0.2.2


  private currentUserSubject: BehaviorSubject<LoginResponse | null>;
  public currentUser: Observable<LoginResponse | null>;

  constructor(private http: HttpClient, private router: Router, private configService: Config) {
    // Recuperamos sesión de localStorage
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<LoginResponse | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

   private get baseUrl(): string {
    // Ajusta '/lo-que-sea' según el servicio (ej: '/auth', '/expertos')
    return `${this.configService.getApiUrl()}/api/auth`; 
  }

  public get currentUserValue(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  login(usuario: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { usuario, password })
      .pipe(map(response => {
        if (response && response.token) {
          // Guardamos en localStorage (Para tesis está bien, para prod usaríamos Capacitor Storage)
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        }
        return response;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}