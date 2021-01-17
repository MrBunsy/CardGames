import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Card } from '../models/card';
import { Deck } from '../models/deck';
import { CardsInTrickEventInfo, EventInfo, GameEvent, IGame, Trick } from '../models/game';
import { LocalPresidentGame, PresidentRoundEndEventInfo } from '../models/president';
import { PresidentPlayer } from '../models/PresidentPlayer';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class PresidentGameService extends GameService {
  //the state of players as known from tracking game events
  // private players: PresidentPlayer[];
  // private playerStateChanged: Subject<boolean> = new Subject<boolean>();
  private currentPlayOrder: PresidentPlayer[] = [];
  private trick: Trick;

  private cardSwapInProgress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    super();
  }

  public createPresident(players: PresidentPlayer[], eventInterval: number = 1000, localPlayer: PresidentPlayer = null, verbose: boolean = false) {
    // this.tidyUpGame();
    this.currentPlayOrder = [];
    this.players = [];

    // this.players$.next(players);
    this.game = new LocalPresidentGame(players);

  //so as not to interfer with the internal state of the same player class that will be used by the local AI game, create new objects here
    //players don't get cards until the game is created
    for (let player of players) {
      let playerTracker = new PresidentPlayer(player.name);
      playerTracker.tracksPlayer = player;
      // playerTracker.cards = player.cards;
      this.players.push(playerTracker);
      this.currentPlayOrder.push(playerTracker);
      playerTracker.isLocal = false;
      playerTracker.hasSkipped = false;
    }
    

    this.rounds = 0;

    this.eventInterval = eventInterval;
    this.subscribetoGame();

  }

  private roundStarted(){
    

    //deal out fake cards, these will only be shown face down
    //todo something bit more elegant
    let deck = new Deck(true, false, this.currentPlayOrder.length);
    deck.deal(this.players);
    for (let player of this.currentPlayOrder) {
      player.hasSkipped = false;
      for (let card of player.cards) {
        card.faceUp = false;
      }
    }
  }

  public getPlayers(): Observable<PresidentPlayer[]> {
    //TODO create game staet of players from game events
    return this.gameEventsOut$.asObservable().pipe(map(() => this.currentPlayOrder as PresidentPlayer[]));
  }

  public getCardsForPlayer(name: string):Observable<Card[]>{
    return this.gameEventsOut$.asObservable().pipe(
      map(() => {
        for(let player of this.currentPlayOrder){
          if(player.name == name){
            console.log(`${player.name} has ${player.cards.length} cards`)
            return Array.from(player.cards);
          }
        }
        return [];
      })
    )
  }

  public getTrick(): Observable<Trick> {
    return this.gameEventsOut$.asObservable().pipe(
      map(() => this.trick),
      filter(trick => trick != undefined)
    );
  }

  protected processGameEvent(event: GameEvent) {
    console.log(event.type);
    switch (event.type) {
      case "RoundStart":
        this.roundStarted();
        this.roundInProgressEmittier.next(true);
        break;
      case "RoundEnd": {
        let endInfo = event.eventInfo as PresidentRoundEndEventInfo;
        this.roundInProgressEmittier.next(false);
        //fixup current play order ready for next round
        let order = [...this.currentPlayOrder];
        for (let i = 0; i < endInfo.nextPositions.length; i++) {
          this.currentPlayOrder[endInfo.nextPositions[i]] = order[i];
        }
        this.rounds++;
        this.currentRoundEmitter.next(this.rounds);
      }
        break;
      case "CardsPlayed":
        {
          let cardsPlayed = event.eventInfo as CardsInTrickEventInfo;
          if (cardsPlayed.cards && cardsPlayed.cards.length == 0) {
            //this player passed
            this.currentPlayOrder[cardsPlayed.playerIndex].hasSkipped = true;
          } else {
            //remove some cards from this player
            //not bothering to track which because in remote implementation we won't know anyway
            console.log(`player index: ${cardsPlayed.playerIndex} (${this.currentPlayOrder[cardsPlayed.playerIndex].name} played ${cardsPlayed.cards})`)
            this.currentPlayOrder[cardsPlayed.playerIndex].cards.splice(0, cardsPlayed.cards.length)
            console.log(`cards left: ${this.currentPlayOrder[cardsPlayed.playerIndex].cards.length}`);
          }
          this.trick.cards.push(cardsPlayed);
        }
        break;
      case "SwapCards":
        //players should choose cards to give away
        this.cardSwapInProgress.next(true);
        break;
      case "CardsSwapped":
        //card swap finished
        this.cardSwapInProgress.next(false);
        break;
      case "StartTrick": {

        let start = event.eventInfo as EventInfo;
        //emit player or our representation of player?
        //TODO once real server is working
        this.currentTurnEmitter.next(start.player)

        this.trick = new Trick(start.player);
        for (let player of this.currentPlayOrder) {
          player.hasSkipped = false;
        }
      }
        break;
      case "EndTrick":

        break;
    }

    this.gameEventsOut$.next(event);
  }
  protected isEventFromLocalPlayer(event: GameEvent): boolean {
    //override this
    return false;
  }
}
