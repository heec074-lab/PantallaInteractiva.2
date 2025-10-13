import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-cargarhorarios',
  imports: [],
  templateUrl: './cargarhorarios.html',
  styleUrl: './cargarhorarios.css'
})
export class Cargarhorarios {
  selectedFile: File | null = null;
  excelData: any[] = [];

  constructor(private http: HttpClient){}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension !== 'xlsx' && extension !== 'xls') {
        alert('Solo se permiten archivos Excel (.xlsx o .xls)');
        this.selectedFile = null;
        input.value = ''; 
        return;
      }

      const maxSize = 2 * 1024 * 1024; 
      if (file.size > maxSize){
        alert('El archivo supera el tamaño máximo permitido (2 MB)');
        this.selectedFile = null;
        input.value = '';
        return;
      }

      this.selectedFile = file;
    }
  }

  onUpload() {
    if (this.selectedFile) {
      const reader = new FileReader();
      console.log("Archivo válido para subir:", this.selectedFile.name);
      
      reader.onload = (e: any)=>{
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        this.excelData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        console.log('Datos leídos del Excel:', this.excelData);
        this.subirDatosaBackend();
      };
      reader.readAsArrayBuffer(this.selectedFile);
    }
  }

  subirDatosaBackend() {
    if (!this.excelData.length) {
      alert('No hay datos para subir. Carga un archivo Excel primero.');
      return;
    }

    const datosProcesados = this.excelData.map((row: any) => {
      const siglaSeccion = row['Sigla Sección'] || row['Sigla Secci&oacute;n'] || '';
      const [siglaAsignatura] = siglaSeccion.split('-', 1);

      // Jornada normalizada
      let jornada = '';
      if (row['Jornada']?.toUpperCase() === 'D') jornada = 'D';
      else if (row['Jornada']?.toUpperCase() === 'V') jornada = 'V';

      // Horarios
      let hora_inicio = '';
      let hora_fin = '';
      if (row['Horario']) {
        const partes = row['Horario'].split(/[\s-–]+/);
        if (partes.length >= 2) {
          hora_inicio = partes[0];
          hora_fin = partes[1];
        }
      } else if (row['Hora Inicio'] && row['Hora Fin']) {
        hora_inicio = row['Hora Inicio'];
        hora_fin = row['Hora Fin'];
      }

      const Horario = hora_inicio && hora_fin ? `${hora_inicio} ${hora_fin}` : (row['Horario'] || '');

      // Construir objeto limpio y compatible con el backend
      return {
        fecha: row['Fecha'] || '',
        sigla_asignatura: siglaAsignatura || '',
        nombre_asignatura: row['Nombre Asignatura'] || '',
        codigo_seccion: siglaSeccion || '',
        jornada,
        modalidad: row['Modalidad'] || '',
        id_docente: row['Id Docente'] || '',
        rut_docente: row['Rut Docente'] || '',
        apellido_paterno: row['Apellido Paterno'] || '',
        apellido_materno: row['Apellido Materno'] || '',
        nombres: row['Nombres'] || '',
        sala: row['Sala'] || '',
        tipo: row['Tipo'] || '',
        hora_inicio,
        hora_fin,
        observacion: row['Detalle'] || '',
        Fecha: row['Fecha'] || '',
        Horario,
        'Sigla Sección': siglaSeccion
      };
    });

    console.log('🚀 Datos procesados listos para enviar:', datosProcesados);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('http://localhost:3000/clases', datosProcesados, { headers })
      .subscribe({
        next: (res) => {
          console.log('✅ Datos enviados correctamente al backend:', res);
          alert('Datos cargados exitosamente.');
        },
        error: (err) => {
          console.error('❌ Error al enviar datos al backend:', err);
          alert(`Error al subir los datos. Código ${err.status}.`);
        }
      });
  }
}

