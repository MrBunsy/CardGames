import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { DeclarationWhistGameEvents, LocalDeclarationWhist } from 'src/app/models/declaration-whist';
import { DeclarationWhistPlayer, LocalHuman, Moron } from 'src/app/models/player';
import { Suit, Card } from 'src/app/models/card';
import { HumanPlayerService, PlayerState } from 'src/app/services/human-player.service';
import { tap } from 'rxjs/operators';
import { GameService } from 'src/app/services/game.service';
import { CleverBot } from 'src/app/models/clever-bot';

@Component({
  selector: 'app-play-against-bots',
  templateUrl: './play-against-bots.component.html',
  styleUrls: ['./play-against-bots.component.css']
})
export class PlayAgainstBotsComponent implements OnInit, OnDestroy {

  public players: DeclarationWhistPlayer[];
  // public player: LocalHuman;
  // public game: LocalDeclarationWhist;

  public log: DeclarationWhistGameEvents[] = [];

  private subscriptions: Subscription[] = [];

  public showBidSelection: boolean = false;
  public hand: Card[] = [];
  public playerState$: Observable<PlayerState>;
  public playerCards$: Observable<Card[]>;
  public validBids$: Observable<number[]>;

  public roundRunning$: Observable<boolean>;
  


  constructor(private deckService: DeckService, private player: HumanPlayerService, private game: GameService) {



    this.players = [
      // new Moron("Ted"),
      // new Moron("Bill"),
      // new Moron("Steve"),
      new CleverBot("Clever Ted"),
      new CleverBot("Clever Bill"),
      new CleverBot("Clever Steve"),
      this.player.createPlayer()
    ];

    this.playerState$ = this.player.playerState$.asObservable().pipe(tap(state => console.log("PlayerState: " + state)));
    this.playerCards$ = this.player.cards$.asObservable();
    this.validBids$ = this.player.validBids$.asObservable();

    //TODO either/and see if a game is in progress, and connect to it (with mechanism to re-emit various observables?) 
    //or ensure that creating a new game always ends an existing game
    this.game.createDeclarationWhist(this.players, 1000, 3);

    this.subscriptions.push(this.game.getGameEvents().subscribe(event => this.log.push(event)));

    this.roundRunning$ = this.game.getRoundInProgress();
    
  }

  ngOnInit() {
    // this.game.start();
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }

}
