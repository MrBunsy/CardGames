import { Injectable, OnDestroy } from '@angular/core';
import { Subject, ReplaySubject, Observable, Subscription } from 'rxjs';
import { Suit, Card } from '../models/card';
import { LocalHuman } from '../models/player';
import { CardInTrick } from '../models/declaration-whist';
import { first } from 'rxjs/operators';

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
  //emitted when we need to bid
  public validBids$: ReplaySubject<number[]> = new ReplaySubject<number[]>(1);
  //emitted if we need to choose trumps (true for we need to choose, false for we've already chosen)
  public chooseTrumps$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  //emitted when we need to play a card
  public validCardsToPlay$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);


  private player: LocalHuman;


  constructor() { }

  public getPlayer(name: string = "You"): LocalHuman {
    this.player = new LocalHuman(name, this.bid$, this.trumps$, this.playCard$);

    //TODO clear subs at end of a match?
    // this.playerSubscriptions.push(this.player.cards$.asObservable().subscribe(cards => this.cards$.next(cards)));

    //parrot out the bids
    this.player.validBids$.asObservable().pipe(first()).subscribe(validBids => this.validBids$.next(validBids));

    //and trumps
    this.player.chooseTrumps$.asObservable().pipe(first()).subscribe(() => this.chooseTrumps$.next(true));

    this.playerSubscriptions.push(this.player.validCardsToPlay$.subscribe(validCards => this.validCardsToPlay$.next(validCards)));

    this.cards$ = this.player.cards$;

    return this.player;
  }

  public chooseBid(bid: number) {
    this.bid$.next(bid);
  }

  public chooseTrumps(trumps: Suit) {
    this.trumps$.next(trumps);
  }

  public playCard(card: Card) {
    this.validCardsToPlay$.next(null);
    this.playCard$.next(card);
  }

  ngOnDestroy(): void {
    for (let sub of this.playerSubscriptions) {
      sub.unsubscribe();
    }

    this.playerSubscriptions = [];
  }
}
