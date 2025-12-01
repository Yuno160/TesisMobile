import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../interfaces/patient.interface';
import { Config } from '../services/config';
@Injectable({
  providedIn: 'root',
})
export class pacientesService {
  
  
  // RECUERDA: Si estás en PC usa localhost, si es celular usa tu IP

  constructor(private http: HttpClient, 
    private configService: Config) { }
  private get baseUrl(): string {
    // Ajusta '/lo-que-sea' según el servicio (ej: '/auth', '/expertos')
    return `${this.configService.getApiUrl()}/api/pacientes`; 
  }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  // CORRECCIÓN 1: Tu ruta backend es /id/:id
  getPacienteById(id_paciente: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/id/${id_paciente}`);
  }

  // CORRECCIÓN 2: Tu ruta backend es /delete/:carnet_identidad
  // (Ojo: Recibimos string porque el carnet puede tener letras)
  deletePaciente(carnet_identidad: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${carnet_identidad}`);
  }

  crearPaciente(paciente: Paciente): Observable<any> {
    return this.http.post(this.baseUrl, paciente);
  }

  // CORRECCIÓN 3: Tu ruta backend es /edit/:carnet_identidad
  // Necesitamos el carnet original para la URL, y los datos nuevos en el body
  actualizarPaciente(carnetOriginal: string, paciente: Paciente): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit/${carnetOriginal}`, paciente);
  }
}