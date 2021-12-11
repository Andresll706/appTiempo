import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

export class CardComponent implements OnInit {

  @Input() municipio: any;
  @Input() tiempo: any;
  day: string = "";

  today = new Date();
  tomorrow = new Date(this.today);

  public static dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as const;

  constructor() { 
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.day = this.tomorrow.toLocaleDateString("es-ES", CardComponent.dateOptions);
  }

  ngOnInit(): void {
  }

}
