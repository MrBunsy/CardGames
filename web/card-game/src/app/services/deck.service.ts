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

  
}
