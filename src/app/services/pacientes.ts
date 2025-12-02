import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../interfaces/patient.interface';
import { Config } from '../services/config';
@Injectable({
  providedIn: 'root',
})
export class pacientesService {
  
  
 
  constructor(private http: HttpClient, 
    private configService: Config) { }
  private get baseUrl(): string {
    return `${this.configService.getApiUrl()}/api/pacientes`; 
  }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.baseUrl);
  }

  getPacienteById(id_paciente: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.baseUrl}/id/${id_paciente}`);
  }

 deletePaciente(carnet_identidad: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${carnet_identidad}`);
  }

  crearPaciente(paciente: Paciente): Observable<any> {
    return this.http.post(this.baseUrl, paciente);
  }

  actualizarPaciente(carnetOriginal: string, paciente: Paciente): Observable<any> {
    return this.http.put(`${this.baseUrl}/edit/${carnetOriginal}`, paciente);
  }
}