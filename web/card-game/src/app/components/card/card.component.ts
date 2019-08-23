import { Component, OnInit, Input } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { Card } from 'src/app/models/card';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  public image: string;
  @Input() card: Card;

  constructor(private deck: DeckService) {

  }

  ngOnInit() {
    this.image = this.deck.getStyle() + "/" + this.card.toString() + ".svg";
  }

}
