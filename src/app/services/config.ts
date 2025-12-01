import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Config {

  private STORAGE_KEY = 'api_ip_config';
  // IP por defecto (tu localhost) por si el usuario no configura nada
  private currentIp = 'http://localhost:3000/api'; 

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    const storedIp = localStorage.getItem(this.STORAGE_KEY);
    if (storedIp) {
      // Si el usuario guardó "192.168.1.50", lo convertimos a la URL completa
      this.currentIp = `http://${storedIp}:3000/api`;
    }
  }

  saveIp(ip: string) {
    // Guardamos solo la IP limpia (ej: 192.168.1.50)
    localStorage.setItem(this.STORAGE_KEY, ip);
    this.currentIp = `http://${ip}:3000/api`;
  }

  getApiUrl(): string {
    return this.currentIp;
  }
  
  getRawIp(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }
}