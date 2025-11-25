import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpertoService {

  // Ajusta a tu IP si es necesario
  private API_URL = 'http://localhost:3000/api/experto'; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene las preguntas para una categoría padre (ej: 'b1' para funciones mentales)
   */
  getPreguntas(categoriaPadre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/preguntas/${categoriaPadre}`);
  }

  /**
   * Envía las respuestas al Motor de Inferencia
   * Entrada: [{ pregunta_id: 1, respuesta: 'grave' }, ...]
   * Salida: [{ codigo: 'b110.3', descripcion: '...' }, ...]
   */
  evaluarRespuestas(respuestas: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.API_URL}/evaluar`, respuestas);
  }
}