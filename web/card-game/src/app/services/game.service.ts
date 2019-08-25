import { Injectable } from '@angular/core';
import { DeckService } from './deck.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private deckService: DeckService) {
    
   }
}
