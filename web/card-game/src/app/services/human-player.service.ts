import { Injectable, OnDestroy } from '@angular/core';
import { Subject, ReplaySubject, Observable, Subscription, BehaviorSubject } from 'rxjs';
import { Suit, Card } from '../models/card';
import { LocalHumanDeclarationWhist, DeclarationWhistPlayer } from '../models/declaration-whist-player';
import { first } from 'rxjs/operators';
import { WhistGameService } from './game.service';

export type PlayerState = "Waiting" | "ChoosingBid" | "ChoosingTrumps" | "ChoosingCard";

/**
 * This class is for combining user input with the localplayer class that talks directly to the game
 * 
 * Complication is that sometimes we want to slow down when we request user input to match with
 * when we're slowly playing back bot behaviour, which is far behind the state of the game object.
 * 
 * The GameService is what is slowly replaying back the game to the user, despite the fact that 
 * the game object itself is unaware of this
 */
@Injectable({
  providedIn: 'root'
})
export class HumanPlayerService implements OnDestroy {


  //inputs for hte player's moves
  private bid$: Subject<number> = new Subject<number>();
  private trumps$: Subject<Suit> = new Subject<Suit>();
  private playCard$: Subject<Card> = new Subject<Card>();

  private playerSubscriptions: Subscription[] = [];

  // //outputs when the player wants some input
  //duplicating here rather than just passing on the players, so we can cache output if it was missed by any single component
  //cards dealt
  public cards$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);
  //emitted when we need to bid (declaration whist)
  public validBids$: ReplaySubject<number[]> = new ReplaySubject<number[]>(1);
  //emitted if we need to choose trumps (true for we need to choose, false for we've already chosen) (declaration whist)
  public chooseTrumps$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  //emitted when we need to play a card (declaration whist)
  public validCardsToPlay$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);

  public playerState$: BehaviorSubject<PlayerState> = new BehaviorSubject<PlayerState>("Waiting");


  private player: LocalHumanDeclarationWhist;


  constructor(private gameService: WhistGameService) { }

  public createPlayer(name: string = "You"): LocalHumanDeclarationWhist {
    this.player = new LocalHumanDeclarationWhist(name, this.bid$, this.trumps$, this.playCard$);

    //TODO clear subs at end of a match?

    //parrot out the bids
    this.playerSubscriptions.push(this.player.validBids$.asObservable().subscribe(validBids => this.needToChooseBid(validBids)));

    //and trumps
    this.playerSubscriptions.push(this.player.chooseTrumps$.asObservable().subscribe(() => this.needToChooseTrumps()));

    this.playerSubscriptions.push(this.player.validCardsToPlay$.subscribe(validCards => this.needToChooseCard(validCards)));

    this.cards$ = this.player.cards$;

    return this.player;
  }

  public needToChooseBid(validBids: number[]) {
    this.playerState$.next("ChoosingBid");
    this.validBids$.next(validBids)

  }

  public getPlayer(): DeclarationWhistPlayer {
    return this.player;
  }

  public needToChooseTrumps() {
    this.playerState$.next("ChoosingTrumps");
    this.chooseTrumps$.next(true);
  }

  public needToChooseCard(validCards: Card[]) {
    this.playerState$.next("ChoosingCard");
    this.validCardsToPlay$.next(validCards);

  }

  public chosenBid(bid: number) {
    this.playerState$.next("Waiting");
    this.bid$.next(bid);

  }

  public chosenTrumps(trumps: Suit) {
    this.playerState$.next("Waiting");
    this.trumps$.next(trumps);

  }

  public playCard(card: Card) {
    if (this.playerState$.value == "ChoosingCard") {
      this.playerState$.next("Waiting");
      this.playCard$.next(card);


    }
  }

  ngOnDestroy(): void {
    for (let sub of this.playerSubscriptions) {
      sub.unsubscribe();
    }

    this.playerSubscriptions = [];
  }
}
