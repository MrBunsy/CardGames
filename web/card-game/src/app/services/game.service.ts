import { Injectable, OnDestroy } from '@angular/core';
import { DeckService } from './deck.service';
import { DeclarationWhistPlayer } from '../models/player';
import { LocalDeclarationWhist, DeclarationWhistGameEvents, Trumps, Bid, Trick, CardInTrick, EventInfo } from '../models/declaration-whist';
import { Observable, Subscription, ReplaySubject, of } from 'rxjs';
import { map, filter, delay, concatMap } from 'rxjs/operators';

class PlayerWithInfo {
  public player: DeclarationWhistPlayer;
  public cards: number = 13;
  public tricksWon: number = 0;
  public turnToPlay: boolean = false;
}
/**
 * Not wanting a game to expose all its inner state, track what state we want here, purely from game events.
 * 
 * Then we can replay a game back at whatever speed we like, without altering the game class
 */
@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {

  private game: LocalDeclarationWhist;
  private players: PlayerWithInfo[];
  private subscriptions: Subscription[] = [];

  private gameEventsOut$: ReplaySubject<DeclarationWhistGameEvents> = new ReplaySubject<DeclarationWhistGameEvents>(10);
  private trickEmitter: ReplaySubject<Trick> = new ReplaySubject<Trick>(1);
  private tricks: number = 0;
  private currentTurnEmitter: ReplaySubject<DeclarationWhistPlayer> = new ReplaySubject<DeclarationWhistPlayer>(1);

  private currentTrick: Trick = null;

  constructor(private deckService: DeckService) {

  }
  /**
   * Set the player as being to play next.
   * -1 for no-one currently waiting to play
   */
  private setTurnToPlay(playerIndex: number = -1) {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].turnToPlay = playerIndex == i;
    }

    this.currentTurnEmitter.next(playerIndex >= 0 ? this.players[playerIndex].player : null);

  }

  private processGameEvent(event: DeclarationWhistGameEvents) {

    switch (event.type) {
      case "CardPlayed":

        let cardEvent = <CardInTrick>event.event;
        if (this.currentTrick == null) {
          this.currentTrick = new Trick(cardEvent.player)
        }
        this.currentTrick.cards.push(cardEvent);
        this.trickEmitter.next(this.currentTrick);

        this.players[cardEvent.playerIndex].cards--;
        if (this.currentTrick.cards.length < 4) {
          this.setTurnToPlay((cardEvent.playerIndex + 1) % this.players.length);
        } else {
          this.setTurnToPlay();
        }
        break;
      case "TrickWon":
        let trickWonEvent = <EventInfo>event.event;
        this.currentTrick.winner = trickWonEvent.player;
        this.players[trickWonEvent.playerIndex].tricksWon++;
        this.trickEmitter.next(this.currentTrick);
        this.tricks++;
        this.currentTrick = null;
        if (this.tricks < 13) {
          this.setTurnToPlay(trickWonEvent.playerIndex);
        } else {
          //no more turns until a new match
          this.setTurnToPlay();
        }
        break;
      case "Trumps":
        //whoever chose trumps gets to play next
        this.setTurnToPlay((<Trumps>event.event).playerIndex);
        break;
    }
    console.log("Event: " + event.type);
    this.gameEventsOut$.next(event)
  }

  public createDeclarationWhist(players: DeclarationWhistPlayer[]) {
    this.players = [];
    for (let player of players) {
      this.players.push({ player: player, cards: 13, tricksWon: 0, turnToPlay: false });
    }

    this.game = new LocalDeclarationWhist(players, this.deckService.getDeck(), 0);

    //isn't there a thing to make an observable hot? shouldn't we use that?
    this.subscriptions.push(this.game.gameEvents.asObservable().pipe(
      //https://observablehq.com/@btheado/rxjs-inserting-a-delay-between-each-item-of-a-stream
      //TODO extra funky logic to not delay player's events
      concatMap(i => of(i).pipe(delay(1000)))
    ).subscribe(
      event => this.processGameEvent(event)
    ));

  }

  public getGameEvents(): Observable<DeclarationWhistGameEvents> {
    return this.gameEventsOut$.asObservable().pipe(

    )
  }


  public start() {
    if (!this.game) {
      console.warn("No game created yet");
      return;
    }
    this.game.start();
  }

  private _getPlayerCardCounts(): number[] {
    let counts = [];
    for (let player of this.players) {
      counts.push(player.cards);
    }
    return counts;
  }

  public getPlayerCardCounts(): Observable<number[]> {
    //use game events to judge when this might have changed
    return this.getGameEvents().pipe(
      filter(event => event.type == "CardPlayed" || event.type == "MatchStart"),
      map(() => this._getPlayerCardCounts())
    )
  }

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
        let index = this.players.findIndex(test => test.player == player);
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

  private _getPlayerTrickCounts(): number[] {
    let counts = [];
    for (let player of this.players) {
      counts.push(player.tricksWon);
    }
    return counts;
  }

  public getTricksWonFor(player: DeclarationWhistPlayer): Observable<number> {
    return this.getGameEvents().pipe(
      filter(event => event.type == "TrickWon"),
      map(() => this._getPlayerTrickCounts()),
      map(cardCounts => {
        let index = this.players.findIndex(test => test.player == player);
        return cardCounts[index];
      })
    )
  }

  /**
   * Return true when it's the requested player's time to play a card, false otherwise
   * @param player 
   */
  public getTurnToPlayFor(player: DeclarationWhistPlayer): Observable<boolean> {
    return this.currentTurnEmitter.asObservable().pipe(
      map(currentPlayer => currentPlayer === player)
    );
  }

  public getCurrentTrick(): Observable<Trick> {
    return this.trickEmitter.asObservable();
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }


}
