import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Card } from 'src/app/models/card';

class DrawableCard {
  public card: Card;
  public zIndex: number;
}

@Component({
  selector: 'trick',
  templateUrl: './trick.component.html',
  styleUrls: ['./trick.component.css']
})
export class TrickComponent implements OnInit, OnChanges {


  //expects an array of 4, must use nulls for missing cards
  //[left, top, right, bottom]
  @Input() cards: Card[];
  //which card was played first (and therefore has lowest z-index)
  @Input() first: number;

  public drawableCards: DrawableCard[] = [null, null, null, null];

  constructor() { }

  private setupCards() {

    let zIndexes = [0, 0, 0, 0];
    for (let i = 0; i < this.cards.length; i++) {
      zIndexes[(i + this.first) % this.cards.length] = i;
    }

    for (let i = 0; i < this.cards.length; i++) {

      this.drawableCards[i] = this.cards[i] ? { card: this.cards[i], zIndex: zIndexes[i] } : null;

    }
  }

  ngOnInit() {
    this.setupCards();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setupCards();
  }

}
