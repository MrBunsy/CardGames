import { Component, OnInit, Input } from '@angular/core';
import { Card } from 'src/app/models/card';
import { DeckService } from 'src/app/services/deck.service';

@Component({
  selector: 'hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.css']
})
export class HandComponent implements OnInit {

  @Input() cards: Card[];
  @Input() active: boolean = false;

  public style: string;

  constructor(private deckService: DeckService) {
    this.style = deckService.getStyle();
  }

  ngOnInit() {
    this.cards = this.deckService.sort(this.cards);
  }

}
