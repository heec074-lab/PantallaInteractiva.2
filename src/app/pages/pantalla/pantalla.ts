import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Mostrarhorario, Clase } from '../../services/mostrarhorario';

@Component({
  selector: 'app-pantalla',
  standalone: true,
  imports: [CommonModule, HttpClientModule], // IMPORTANTE para HttpClient
  templateUrl: './pantalla.html',
  styleUrls: ['./pantalla.css'] 
})
export class Pantalla implements OnInit {
  clases: Clase[] = [];
  cargando = true;
  error: string | null = null;

  constructor(private mostrarHorario: Mostrarhorario) {}

  ngOnInit(): void {
    this.mostrarHorario.getHorarios().subscribe({
      next: (data) => {
        this.clases = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando horarios:', err);
        this.error = 'No se pudo cargar los horarios.';
        this.cargando = false;
      }
    });
  }
}

