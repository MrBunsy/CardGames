import { Injectable } from '@angular/core';
import { Card, Suit } from '../models/card';
import { Deck } from '../models/deck';

// const shuffle = require('fisher-yates-shuffle');

@Injectable({
  providedIn: 'root'
})
export class DeckService {

  constructor() { }

  public getStyle(): string {
    //unfortunatly the gpl cards render best in chrome
    return "vpc";//"poker-old-Large";;//"poker-Large";//"poker-super-aspect-Large";//"vpc";//"poker-Large";
  }

  public getDeck(shuffled = true, jokers = false): Deck {
    return new Deck(shuffled, jokers);

  }

  public suitValue(suit: Suit): number {
    switch (suit) {
      case "Clubs":
        return 0;
      case "Diamonds":
        return 1;
      case "Hearts":
        return 2;
      case "Spades":
        return 3;
    }
  }

  private cardValue(card: Card, groupSuits: boolean): number {
    if (groupSuits) {
      return card.value + 13 * this.suitValue(card.suit);
    } else {
      return card.value * 4 + this.suitValue(card.suit);
    }
  }

  public sort(cards: Card[], groupSuits: boolean = true) {
    return cards.sort((cardA, cardB) => this.cardValue(cardA, groupSuits) - this.cardValue(cardB, groupSuits))
  }
}
