import { Injectable, OnDestroy } from '@angular/core';
import { DeckService } from './deck.service';
import { DeclarationWhistPlayer } from '../models/player';
import { LocalDeclarationWhist, DeclarationWhistGameEvents, TrumpsEvent, BidEvent, Trick, CardInTrickEvent, EventInfo, ResultsEvent } from '../models/declaration-whist';
import { Observable, Subscription, ReplaySubject, of, BehaviorSubject, merge } from 'rxjs';
import { map, filter, delay, concatMap, combineLatest } from 'rxjs/operators';

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
  private currentRoundEmitter: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private roundInProgressEmittier: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private currentTrick: Trick = null;

  private localPlayerIndex: number;
  private rounds: number = 0;
  private eventInterval: number = 1000;

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

        let cardEvent = <CardInTrickEvent>event.event;
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

  private isEventFromLocalPlayer(event: DeclarationWhistGameEvents): boolean {

    if (event.type == "Bid" || event.type == "CardPlayed" || event.type == "Trumps") {//deliberately exclude TrickWon, since this didn't directly originate from player action
      return (<EventInfo>event.event).playerIndex == this.localPlayerIndex;
    }

    return false;
  }

  /**
   * 
   * @param players 
   * @param eventInterval time, in ms, each event is artifically delayed for
   * @param localPlayerIndex 
   */
  public createDeclarationWhist(players: DeclarationWhistPlayer[], eventInterval: number = 1000 , localPlayerIndex: number = -1, verbose: boolean = false) {
    this.tidyUpGame();
    this.eventInterval = eventInterval;
    this.localPlayerIndex = localPlayerIndex;
    this.players = [];
    for (let player of players) {
      this.players.push(new PlayerWithInfo(player));
    }

    this.game = new LocalDeclarationWhist(players, Math.floor(Math.random() * this.players.length), verbose);

    //isn't there a thing to make an observable hot? shouldn't we use that?
    this.subscriptions.push(this.game.gameEvents.asObservable().pipe(
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

  public getGameEvents(): Observable<DeclarationWhistGameEvents> {
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
    this.game.start(this.deckService.getDeck());
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

  public getCardCountFor(player: DeclarationWhistPlayer) {
    return this.getPlayerCardCounts().pipe(
      map(allCounts => {
        let index = this.players.findIndex(test => test.player == player);
        return allCounts[index];
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
  private tidyUpGame() {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];

    this.game = null;
    this.players = [];

    this.gameEventsOut$ = new ReplaySubject<DeclarationWhistGameEvents>(10);
    this.trickEmitter = new ReplaySubject<Trick>(1);
    this.tricks = 0;
    this.currentTurnEmitter = new ReplaySubject<DeclarationWhistPlayer>(1);
    this.currentRoundEmitter = new BehaviorSubject<number>(0);
    this.roundInProgressEmittier = new BehaviorSubject<boolean>(false);

    this.currentTrick = null;

    this.rounds = 0;
  }

  ngOnDestroy(): void {
    this.tidyUpGame();
  }


}
