import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../services/config';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionService {

 

  constructor(private http: HttpClient, 
    private configService: Config) { }
    private get baseUrl(): string {
    return `${this.configService.getApiUrl()}/api`; 
  }

  /**
   * 1. Obtener el Árbol CIF completo
   * Esto llama a tu cifCodeController.getCifTree
   */
 obtenerArbolCIF(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cif-codes/tree`); 
  }

  /**
   * 2. Guardar la calificación
   * Llama a calificacionController.crearCalificacion
   * Body: { id_paciente, observaciones, codigos: ["b280.1", "s110.2"] }
   */
  guardarCalificacion(data: { id_paciente: number, observaciones: string, codigos: string[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/calificaciones`, data);
  }
  
    obtenerCalificacionPorPaciente(idPaciente: number): Observable<any> {
    // Tu ruta en calificacion.js es: router.get('/paciente/:id_paciente', ...)
    return this.http.get<any>(`${this.baseUrl}/calificaciones/paciente/${idPaciente}`);
  }
}