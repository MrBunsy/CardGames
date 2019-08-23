import { Injectable } from '@angular/core';
import { Card, Suit } from '../models/card';
import shuffle from '../misc';

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

  public getDeck(shuffled = true, jokers = false): Card[] {
    let deck: Card[] = [];

    
    for(let suit in Suit){//[Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade]
      for(let value = 2; value <= 14;value++){
        //magic https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
        deck.push(new Card((<any>Suit)[suit], value))
      }
    }

    if(shuffled){
      deck = shuffle(deck);
    }

    return deck;

  }
}
