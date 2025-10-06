import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Clase {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class Mostrarhorario {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/clases'

  getHorarios(): Observable<Clase[]> {
    return this.http.get<Clase[]>(this.apiUrl);
  }
}
