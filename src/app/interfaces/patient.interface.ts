export interface Paciente {
  id_paciente: number;
  nombre: string;
  carnet_identidad: string;
  edad: number;
  telefono?: number;
  direccion?: string;
  genero?: 'Masculino' | 'Femenino' | 'Otro';
  antecedentes_medicos?: string;

  // ESTE ES EL NUEVO CAMPO QUE VIENE DEL SQL
  // El backend devuelve 1 (true) o 0 (false)
  ya_calificado?: number; 
}