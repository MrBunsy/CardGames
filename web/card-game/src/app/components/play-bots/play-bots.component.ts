import { Component, OnInit, OnDestroy } from '@angular/core';
import { Moron, LocalHuman, DeclarationWhistPlayer } from 'src/app/models/player';
import { LocalDeclarationWhist } from 'src/app/models/declaration-whist';
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

  public log: string[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private deckService: DeckService) {

    this.player = new LocalHuman();

    this.players = [
      new Moron("Ted"),
      new Moron("Bill"),
      new Moron("Steve"),
      // this.player
      new Moron("Bob")
    ];

    this.game = new LocalDeclarationWhist(this.players, this.deckService.getDeck(), 0);

    this.game.playerBids.subscribe(bid => this.log.push(bid.player.name + " bid " + bid.bid));

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
