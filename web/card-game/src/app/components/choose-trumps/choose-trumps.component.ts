import { Component, OnInit } from '@angular/core';
import { HumanPlayerService } from 'src/app/services/human-player.service';
import { Card, suitArray } from 'src/app/models/card';

@Component({
  selector: 'choose-trumps',
  templateUrl: './choose-trumps.component.html',
  styleUrls: ['./choose-trumps.component.css']
})
export class ChooseTrumpsComponent implements OnInit {

  public cards: Card[];

  constructor(public player: HumanPlayerService) {
    this.cards = [];
    for (let suit of suitArray) {
      this.cards.push(new Card(suit, 0, true));
    }
    //no trumps option
    this.cards.push(new Card(null, 0, true))
  }

  public suitChosen(card: Card) {
    this.player.chosenTrumps(card.suit);
  }

  ngOnInit() {
  }

}
