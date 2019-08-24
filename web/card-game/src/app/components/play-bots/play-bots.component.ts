import { Component, OnInit } from '@angular/core';
import { Moron, LocalHuman, DeclarationWhistPlayer } from 'src/app/models/player';
import { LocalDeclarationWhist } from 'src/app/models/declaration-whist';
import { DeckService } from 'src/app/services/deck.service';

@Component({
  selector: 'app-play-bots',
  templateUrl: './play-bots.component.html',
  styleUrls: ['./play-bots.component.css']
})
export class PlayBotsComponent implements OnInit {

  public players: DeclarationWhistPlayer[];
  public player: LocalHuman;
  public game: LocalDeclarationWhist;

  constructor(private deckService: DeckService) {

    this.player = new LocalHuman();

    this.players = [
      new Moron("Ted"),
      new Moron("Bill"),
      new Moron("Steve"),
      this.player
    ];

    this.game = new LocalDeclarationWhist(this.players, this.deckService.getDeck())

  }

  ngOnInit() {
  }

}
