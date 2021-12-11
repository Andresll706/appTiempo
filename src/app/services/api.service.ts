import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private http: HttpClient) { }

  // Get Municipios
  getMunicipios(){
    return this.http.get('/api/municipios');
  }

  // Get Temperature Municipios
  getTempMunicipios(codigo:string, unidad:string ){
    if(codigo != "" && unidad != ""){
      return this.http.get('/api/tiempo?codigo=' + codigo + "&unidad="+ unidad);
    }else if(codigo != ""){
      return this.http.get('/api/tiempo?codigo=' + codigo + "&unidad=G_CEL");
    }

    return null;
  }

  
  // Error handling
  private error (error: any) {
    let message = (error.message) ? error.message :
    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(message);
  }
}
