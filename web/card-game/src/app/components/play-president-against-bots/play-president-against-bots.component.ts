import { Component, OnInit } from '@angular/core';
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

  public players: PresidentPlayer[];

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
   }

  ngOnInit() {
  }

}
