import { Component, OnInit, OnDestroy } from '@angular/core';
import { Moron, LocalHuman, DeclarationWhistPlayer } from 'src/app/models/player';
import { LocalDeclarationWhist, DeclarationWhistGameEvents } from 'src/app/models/declaration-whist';
import { DeckService } from 'src/app/services/deck.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-play-bots',
  templateUrl: './play-bots.component.html',
  styleUrls: ['./play-bots.component.css']
})
export class PlayBotsComponent implements OnInit, OnDestroy {


  public players: DeclarationWhistPlayer[];
  public player: LocalHuman;
  public game: LocalDeclarationWhist;

  public log: DeclarationWhistGameEvents[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private deckService: DeckService) {

    // this.player = new LocalHuman();

    this.players = [
      new Moron("Ted"),
      new Moron("Bill"),
      new Moron("Steve"),
      // this.player
      new Moron("Bob")
    ];

    this.game = new LocalDeclarationWhist(this.players, 0);

    this.subscriptions.push(this.game.gameEvents.subscribe(event => this.log.push(event)));

    this.game.start(this.deckService.getDeck());

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
