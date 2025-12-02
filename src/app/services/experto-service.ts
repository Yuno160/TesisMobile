import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../services/config';
@Injectable({
  providedIn: 'root',
})
export class ExpertoService {

 
  constructor(private http: HttpClient, private configService: Config) { }

  private get baseUrl(): string {
    return `${this.configService.getApiUrl()}/api/experto`; 
  }

  /**
   * Obtiene las preguntas para una categoría padre (ej: 'b1' para funciones mentales)
   */
  getPreguntas(categoriaPadre: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/preguntas/${categoriaPadre}`);
  }

  /**
   * Envía las respuestas al Motor de Inferencia
   * Entrada: [{ pregunta_id: 1, respuesta: 'grave' }, ...]
   * Salida: [{ codigo: 'b110.3', descripcion: '...' }, ...]
   */
  evaluarRespuestas(respuestas: any[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/evaluar`, respuestas);
  }
}