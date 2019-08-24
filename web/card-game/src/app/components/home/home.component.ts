import { Component, OnInit } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { Card } from 'src/app/models/card';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public deck: Card[];
  public hands: Card[][];

  constructor(private deckService: DeckService) {

    this.deck = this.deckService.getDeck(true).cards;
    this.hands = [];
    for (let i = 0; i < this.deck.length; i += 13) {
      let hand = this.deck.slice(i, i + 13);
      if (i !== 0) {
        for (let c of hand) {
          c.faceUp = false;
        }
      }

      this.hands.push(hand);
    }
    console.log(this.hands)
  }

  ngOnInit() {
  }

}
