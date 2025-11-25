import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../interfaces/patient.interface';
@Injectable({
  providedIn: 'root',
})
export class pacientesService {
  
  
  // RECUERDA: Si estás en PC usa localhost, si es celular usa tu IP
  private API_URL = 'http://localhost:3000/api/pacientes'; 

  constructor(private http: HttpClient) { }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.API_URL);
  }

  // CORRECCIÓN 1: Tu ruta backend es /id/:id
  getPacienteById(id_paciente: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/id/${id_paciente}`);
  }

  // CORRECCIÓN 2: Tu ruta backend es /delete/:carnet_identidad
  // (Ojo: Recibimos string porque el carnet puede tener letras)
  deletePaciente(carnet_identidad: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/delete/${carnet_identidad}`);
  }

  crearPaciente(paciente: Paciente): Observable<any> {
    return this.http.post(this.API_URL, paciente);
  }

  // CORRECCIÓN 3: Tu ruta backend es /edit/:carnet_identidad
  // Necesitamos el carnet original para la URL, y los datos nuevos en el body
  actualizarPaciente(carnetOriginal: string, paciente: Paciente): Observable<any> {
    return this.http.put(`${this.API_URL}/edit/${carnetOriginal}`, paciente);
  }
}