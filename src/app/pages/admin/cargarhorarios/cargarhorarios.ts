import { Component } from '@angular/core';
import * as XLSX from 'xlsx'

@Component({
  selector: 'app-cargarhorarios',
  imports: [],
  templateUrl: './cargarhorarios.html',
  styleUrl: './cargarhorarios.css'
})
export class Cargarhorarios {
  selectedFile: File | null = null;
  excelData: any[] = [];

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
      };
      reader.readAsArrayBuffer(this.selectedFile);
    }
  }
}

