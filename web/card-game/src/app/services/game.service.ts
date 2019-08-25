import { Injectable } from '@angular/core';
import { DeckService } from './deck.service';
import { DeclarationWhistPlayer } from '../models/player';
import { Game } from '../models/game';
import { LocalDeclarationWhist, DeclarationWhistGameEvents, Trumps, Bid, Trick } from '../models/declaration-whist';
import { Observable } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { Suit } from '../models/card';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private game: LocalDeclarationWhist;
  private players: DeclarationWhistPlayer[];

  constructor(private deckService: DeckService) {

  }



  public createDeclarationWhist(players: DeclarationWhistPlayer[]) {
    this.players = players;
    this.game = new LocalDeclarationWhist(players, this.deckService.getDeck(), 0);
  }

  public getGameEvents(): Observable<DeclarationWhistGameEvents> {
    return this.game.gameEvents.asObservable();
  }

  public start() {
    if (!this.game) {
      console.warn("No game created yet");
      return;
    }
    this.game.start();
  }

  public getPlayerCardCounts(): Observable<number[]> {
    //use game events to judge when this might have changed
    return this.getGameEvents().pipe(
      map(() => this.game.getPlayerCardCounts())
    )
  }

  /**
   * Note, will only work if something is listening to observable from before the match start
   */
  public getTrumpsEvent(): Observable<Trumps> {
    return this.getGameEvents().pipe(
      filter(event => event.type == "Trumps"),
      map(trumpEvent => trumpEvent.event),
      //extra step seems to shut the linter up
      map((trumpEvent: Trumps) => trumpEvent),
    )
  }

  public getCardCountFor(player: DeclarationWhistPlayer) {
    return this.getPlayerCardCounts().pipe(
      map(allCounts => {
        let index = this.players.indexOf(player);
        return allCounts[index];
      })
    )
  }

  public getBidsFor(player: DeclarationWhistPlayer) {
    return this.getGameEvents().pipe(
      filter(event => event.type == "Bid"),
      map(event => event.event),
      filter((event: Bid) => event.player == player),
      map(event => event.bid)
    );
  }

  public getTricksWonFor(player: DeclarationWhistPlayer) {
    return this.getGameEvents().pipe(
      filter(event => event.type == "TrickWon"),
      map(() => this.game.getPlayerTrickCounts()),
      map(cardCounts => {
        let index = this.players.indexOf(player);
        return cardCounts[index];
      })
    )
  }

  public getCurrentTrick(): Observable<Trick> {
    return this.game.getTricks();
  }


}
