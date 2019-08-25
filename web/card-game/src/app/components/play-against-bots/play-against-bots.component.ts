import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeckService } from 'src/app/services/deck.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { DeclarationWhistGameEvents, LocalDeclarationWhist } from 'src/app/models/declaration-whist';
import { DeclarationWhistPlayer, LocalHuman, Moron } from 'src/app/models/player';
import { Suit, Card } from 'src/app/models/card';
import { HumanPlayerService, PlayerState } from 'src/app/services/human-player.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-play-against-bots',
  templateUrl: './play-against-bots.component.html',
  styleUrls: ['./play-against-bots.component.css']
})
export class PlayAgainstBotsComponent implements OnInit, OnDestroy {

  public players: DeclarationWhistPlayer[];
  // public player: LocalHuman;
  public game: LocalDeclarationWhist;

  public log: DeclarationWhistGameEvents[] = [];

  private subscriptions: Subscription[] = [];

  public showBidSelection: boolean = false;
  public hand: Card[] = [];
  public playerState$: Observable<PlayerState>;
  public playerCards$: Observable<Card[]>;
  public validBids$: Observable<number[]>;


  constructor(private deckService: DeckService, private player: HumanPlayerService) {



    this.players = [
      new Moron("Ted"),
      new Moron("Bill"),
      new Moron("Steve"),
      this.player.getPlayer()
    ];

    this.playerState$ = this.player.playerState$.asObservable().pipe(tap(state => console.log(state)));
    this.playerCards$ = this.player.cards$.asObservable();
    this.validBids$ = this.player.validBids$.asObservable();

    this.game = new LocalDeclarationWhist(this.players, this.deckService.getDeck(), 0);

    this.subscriptions.push(this.game.gameEvents.subscribe(event => this.log.push(event)));

    this.game.start();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }

}
