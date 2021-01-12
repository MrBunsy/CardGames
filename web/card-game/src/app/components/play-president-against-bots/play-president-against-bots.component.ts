import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PresidentGameEvent } from 'src/app/models/president';
import { MoronPresidentPlayer, PresidentPlayer } from 'src/app/models/PresidentPlayer';
import { WhistGameService } from 'src/app/services/game.service';
import { HumanPlayerService } from 'src/app/services/human-player.service';
import { PresidentGameService } from 'src/app/services/president-game.service';

@Component({
  selector: 'play-president-against-bots',
  templateUrl: './play-president-against-bots.component.html',
  styleUrls: ['./play-president-against-bots.component.css']
})
export class PlayPresidentAgainstBotsComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  public players: PresidentPlayer[];
  public log: PresidentGameEvent[] = [];

  constructor(private player: HumanPlayerService, private game: PresidentGameService) {
    this.players = [
      new MoronPresidentPlayer("Trump"),
      new MoronPresidentPlayer("Bush"),
      new MoronPresidentPlayer("Bob"),
      new MoronPresidentPlayer("Steve"),
      new MoronPresidentPlayer("Phil"),
      new MoronPresidentPlayer("Quail"),
    ]

    game.createPresident(this.players);

    this.subscriptions.push(this.game.getGameEvents().subscribe(event => this.log.push(event as PresidentGameEvent)));

    game.start();

    
   }

  ngOnInit() {
  }

}
