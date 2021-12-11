import {Component, OnInit} from '@angular/core';
import { StatusService } from './services/status.service';
import { FormularioComponent } from './shared/formulario/formulario.component';

/**
 * @title Display value autocomplete
 */
 @Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent implements OnInit {
  title = 'appTiempo';
  status = 'DOWN';

  constructor(private statusService: StatusService) { 
  }

  ngOnInit() {
    this.statusService
    .getStatus()
    .subscribe((result: any) => {
      this.status = result.status;
    });
  }
}