import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import { DatePipe } from '@angular/common';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { CardComponent } from '../card/card.component';

interface Municipio {
  codigo: string;
  nombre: string;
}

interface Temperature {
  value: string;
  viewValue: string;
}

interface Precipitacion{
  probabilidad: string;
  periodo: string;
}
interface Tiempo {
  mediaTemperatura: string;
  unidadTemperatura: string;
  probPrecipitacion: Precipitacion[];
}

/**
 * @title Autocomplete overview
 */
@Component({
  selector: 'formulario',
  templateUrl: 'formulario.component.html',
  styleUrls: ['formulario.component.scss'],
})

export class FormularioComponent implements OnInit {
  MunicipioCtrl = new FormControl();
  filteredMunicipios: Observable<Municipio[]>;
  Municipios: Municipio[] = []; 
  selectedTemperature: Temperature = { value:"", viewValue:""};
  municipioSelect: Municipio | undefined;
  temperatures: Temperature[] = [
    {value: 'G_FAH', viewValue: 'Cº'},
    {value: 'G_CEL', viewValue: 'Fº'}
  ];
  tiempo: Tiempo | undefined;
  showTemp = false;

  constructor(private apiService: ApiService, private datePipe: DatePipe) {
    this.filteredMunicipios = this.MunicipioCtrl.valueChanges.pipe(
      startWith(''),
      map(Municipio => (Municipio ? this._filterMunicipios(Municipio) : this.Municipios.slice())),
    );  
   
  }

  ngOnInit() {
    this.apiService
        .getMunicipios()
        .subscribe((result: any) => {
          this.Municipios = result;
          console.log(this.Municipios[0]);
        });
  }

  private _filterMunicipios(value: string): Municipio[] {
    const filterValue = value.toLowerCase();

    return this.Municipios.filter(Municipio => Municipio.nombre.toLowerCase().includes(filterValue));
  }

  public getTemperature(){
    this.municipioSelect = this.Municipios.find( municipio => municipio.nombre === this.MunicipioCtrl.value );
    console.log(this.selectedTemperature.value);
    if(this.municipioSelect != null){
      this.apiService
          .getTempMunicipios(this.municipioSelect?.codigo, this.selectedTemperature.value)?.subscribe((result: any) => {
            this.showTemp = true;
            console.log(result[0]);
            this.tiempo = result[0];
            if(this.tiempo?.unidadTemperatura == "G_CEL"){
              this.tiempo.unidadTemperatura = "Cº";
            }else if(this.tiempo?.unidadTemperatura == "G_FAH"){
              this.tiempo.unidadTemperatura = "Fº";
            }
          });
    }
    else
    {
      this.showTemp = false;
    }
  }

  public onChangeTemperature(newValue: Temperature){
    console.log(newValue.value);
    this.selectedTemperature = newValue;
    this.getTemperature();
  }
}
