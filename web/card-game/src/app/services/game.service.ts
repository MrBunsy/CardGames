import { Injectable, OnDestroy } from '@angular/core';
import { DeckService } from './deck.service';
import { CardPlayer, DeclarationWhistPlayer } from '../models/declaration-whist-player';
import { LocalDeclarationWhist, TrumpsEvent, BidEvent, Trick, CardsInTrickEvent, EventInfo, ResultsEvent } from '../models/declaration-whist';
import { Observable, Subscription, ReplaySubject, of, BehaviorSubject, merge } from 'rxjs';
import { map, filter, delay, concatMap, combineLatest } from 'rxjs/operators';
import { Card } from '../models/card';
import { PresidentPlayer } from '../models/PresidentPlayer';
import { Game, GameEvent, IGame } from '../models/game';
import { LocalPresidentGame } from '../models/president';

class PlayerWithInfo {
  constructor(public player: DeclarationWhistPlayer) { }
  public cards: number = 13;
  public tricksWon: number = 0;
  public turnToPlay: boolean = false;
  public totalScore: number = 0;

  public nextRound() {
    this.cards = 13;
    this.tricksWon = 0;
    this.turnToPlay = false;
  }
}
@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  protected game: IGame;
  protected players: PlayerWithInfo[];
  protected subscriptions: Subscription[] = [];

  protected gameEventsOut$: ReplaySubject<GameEvent> = new ReplaySubject<GameEvent>(10);

  protected currentTurnEmitter: ReplaySubject<DeclarationWhistPlayer> = new ReplaySubject<DeclarationWhistPlayer>(1);
  protected currentRoundEmitter: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  protected roundInProgressEmittier: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
       * Return true when it's the requested player's time to play a card, false otherwise
       * @param player 
       */
  public getTurnToPlayFor(player: CardPlayer): Observable<boolean> {
    return this.currentTurnEmitter.asObservable().pipe(
      map(currentPlayer => currentPlayer === player)
    );
  }

  protected tidyUpGame() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];

    this.game = null;
    this.players = [];
    this.gameEventsOut$ = new ReplaySubject<GameEvent>(10);
  }

  ngOnDestroy(): void {
    this.tidyUpGame();
  }
}
/**
 * Original intention:
 * 
 * Not wanting a game to expose all its inner state, track what state we want here, purely from game events.
 * 
 * Then we can replay a game back at whatever speed we like, without altering the game class
 * 
 */
@Injectable({
  providedIn: 'root'
})
export class WhistGameService extends GameService {




  private trickEmitter: ReplaySubject<Trick> = new ReplaySubject<Trick>(1);
  private tricks: number = 0;
  

  private currentTrick: Trick = null;

  private localPlayerIndex: number;
  private rounds: number = 0;
  private eventInterval: number = 1000;



  constructor() {
    super()
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

  private processGameEvent(event: GameEvent) {

    switch (event.type) {
      case "CardPlayed":

        let cardEvent = <CardsInTrickEvent>event.event;
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
        this.setTurnToPlay((<TrumpsEvent>event.event).playerIndex);
        break;
      case "MatchStart":
        this.currentRoundEmitter.next(this.rounds);
        this.roundInProgressEmittier.next(true);
        break;
      case "MatchFinished":

        this.roundInProgressEmittier.next(false);
        this.currentRoundEmitter.next(this.rounds);
        this.rounds++;


        break;
    }
    console.log("Event: " + event.type);
    this.gameEventsOut$.next(event)
  }

  private isEventFromLocalPlayer(event: GameEvent): boolean {
    switch (event.game) {
      case Game.DeclarationWhist:
        if (event.type == "Bid" || event.type == "CardPlayed" || event.type == "Trumps") {//deliberately exclude TrickWon, since this didn't directly originate from player action
          return (<EventInfo>event.event).playerIndex == this.localPlayerIndex;
        }
        break;
    }

    return false;
  }

  /**
   * 
   * @param players 
   * @param eventInterval time, in ms, each event is artifically delayed for
   * @param localPlayerIndex 
   */
  public createDeclarationWhist(players: DeclarationWhistPlayer[], eventInterval: number = 1000, localPlayerIndex: number = -1, verbose: boolean = false) {
    this.tidyUpGame();
    this.eventInterval = eventInterval;
    this.localPlayerIndex = localPlayerIndex;
    this.players = [];
    for (let player of players) {
      this.players.push(new PlayerWithInfo(player));
    }

    this.game = new LocalDeclarationWhist(players, Math.floor(Math.random() * this.players.length), verbose);

    this.subscribetoGame();

  }

  private subscribetoGame() {
    //isn't there a thing to make an observable hot? shouldn't we use that?
    this.subscriptions.push(this.game.getGameEvents().pipe(
      //https://observablehq.com/@btheado/rxjs-inserting-a-delay-between-each-item-of-a-stream
      //extra funky logic to not delay player's events
      concatMap(event => {
        if (this.isEventFromLocalPlayer(event)) {
          return of(event)
        } else {
          return of(event).pipe(delay(this.eventInterval))
        }
      }
      )
    ).subscribe(
      event => this.processGameEvent(event)
    ));
  }

  public getGameEvents(): Observable<GameEvent> {
    return this.gameEventsOut$.asObservable().pipe(

    )
  }


  public start() {
    if (!this.game) {
      console.warn("No game created yet");
      return;
    }
    for (let player of this.players) {
      player.nextRound();
    }
    this.tricks = 0;

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

  /**
   * returns null at start of a new round, then a TrumpsEvent when trumps chosen
   */
  public getTrumpsEvent(): Observable<TrumpsEvent> {
    let trumps = this.getGameEvents().pipe(
      filter(event => event.type == "Trumps"),
      map(trumpEvent => trumpEvent.event),
      //extra step seems to shut the linter up
      map((trumpEvent: TrumpsEvent) => trumpEvent),
    )

    let start = this.getMatchStart().pipe(
      map(() => null)
    )
    return merge(trumps, start);
  }

  public getCardCountFor(player: DeclarationWhistPlayer): Observable<number> {
    return this.getPlayerCardCounts().pipe(
      map(allCounts => {
        let index = this.players.findIndex(test => test.player == player);
        return allCounts[index];
      })
    )
  }

  /**
   * Will only work for a local player in debug
   * @param player 
   */
  public getCardsFor(player: DeclarationWhistPlayer): Observable<Card[]> {
    return this.getPlayerCardCounts().pipe(
      map(() => {
        let index = this.players.findIndex(test => test.player == player)
        return this.players[index].player.cards.slice();
      })
    )
  }

  public getMatchStart(): Observable<void> {
    return this.getGameEvents().pipe(
      filter(event => event.type == "MatchStart"),
      map(() => null)
    );
  }

  /**
   * Return current bid for players, or null at the start of a new round
   */
  public getBidsFor(player: DeclarationWhistPlayer): Observable<number> {
    let bids = this.getGameEvents().pipe(
      filter(event => event.type == "Bid"),
      map(event => event.event),
      filter((event: BidEvent) => event.player == player),
      map(event => event.bid)
    );

    let start = this.getMatchStart().pipe(
      map(() => null)
    )

    return merge(bids, start);
  }

  private _getPlayerTrickCounts(): number[] {
    let counts = [];
    for (let player of this.players) {
      counts.push(player.tricksWon);
    }
    return counts;
  }

  /**
   * Return current tricks won for players
   * @param player 
   */
  public getTricksWonFor(player: DeclarationWhistPlayer): Observable<number> {
    return this.getGameEvents().pipe(
      filter(event => event.type == "TrickWon" || event.type == "MatchStart"),
      map(() => this._getPlayerTrickCounts()),
      map(cardCounts => {
        let index = this.players.findIndex(test => test.player == player);
        return cardCounts[index];
      })
    )
  }



  public getCurrentTrick(): Observable<Trick> {

    let start = this.getMatchStart().pipe(
      map(() => null)
    )

    return merge(this.trickEmitter.asObservable(), start)
  }

  /**
   * Get current match number. Null for not started
   */
  public getCurrentRound(): Observable<number> {
    return this.currentRoundEmitter.asObservable();
  }

  public getRoundInProgress(): Observable<boolean> {
    return this.roundInProgressEmittier.asObservable();
  }

  public getCurrentScores(): Observable<ResultsEvent> {
    return this.getGameEvents().pipe(
      filter(event => event.type == "MatchFinished"),
      map(event => <ResultsEvent>event.event)
    )
  }
  protected tidyUpGame() {
    super.tidyUpGame();


    this.trickEmitter = new ReplaySubject<Trick>(1);
    this.tricks = 0;
    this.currentTurnEmitter = new ReplaySubject<DeclarationWhistPlayer>(1);
    this.currentRoundEmitter = new BehaviorSubject<number>(0);
    this.roundInProgressEmittier = new BehaviorSubject<boolean>(false);

    this.currentTrick = null;

    this.rounds = 0;
  }

}
