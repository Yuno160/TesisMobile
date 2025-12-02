import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Config {

  private STORAGE_KEY = 'api_ip_config';
  private currentIp = 'http://localhost:3000'; 

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    const storedIp = localStorage.getItem(this.STORAGE_KEY);
    if (storedIp) {
      this.currentIp = `http://${storedIp}:3000`;
    }
  }

  saveIp(ip: string) {
    localStorage.setItem(this.STORAGE_KEY, ip);
    this.currentIp = `http://${ip}:3000`;
  }

  getApiUrl(): string {
    return this.currentIp;
  }
  
  getRawIp(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }
}