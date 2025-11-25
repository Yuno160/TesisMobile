import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvaluacionService {

  // CAMBIA ESTO POR TU IP SI USAS CELULAR REAL (ej: http://192.168.1.XX:3000/api)
  private API_URL = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  /**
   * 1. Obtener el Árbol CIF completo
   * Esto llama a tu cifCodeController.getCifTree
   */
 obtenerArbolCIF(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/cif-codes/tree`); 
  }

  /**
   * 2. Guardar la calificación
   * Llama a calificacionController.crearCalificacion
   * Body: { id_paciente, observaciones, codigos: ["b280.1", "s110.2"] }
   */
  guardarCalificacion(data: { id_paciente: number, observaciones: string, codigos: string[] }): Observable<any> {
    return this.http.post(`${this.API_URL}/calificaciones`, data);
  }
  
    obtenerCalificacionPorPaciente(idPaciente: number): Observable<any> {
    // Tu ruta en calificacion.js es: router.get('/paciente/:id_paciente', ...)
    return this.http.get<any>(`${this.API_URL}/calificaciones/paciente/${idPaciente}`);
  }
}