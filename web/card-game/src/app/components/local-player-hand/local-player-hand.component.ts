import { Component, OnInit } from '@angular/core';
import { HumanPlayerService } from 'src/app/services/human-player.service';
import { Card } from 'src/app/models/card';

@Component({
  selector: 'local-player-hand',
  templateUrl: './local-player-hand.component.html',
  styleUrls: ['./local-player-hand.component.css']
})
export class LocalPlayerHandComponent implements OnInit {

  constructor(public player: HumanPlayerService) { }

  ngOnInit() {
  }

  public cardChosen(card: Card){
      this.player.playCard(card)
  }

}
