import { Component, OnInit } from '@angular/core';
import { HumanPlayerService } from 'src/app/services/human-player.service';
import { Card } from 'src/app/models/card';
import { WhistGameService } from 'src/app/services/game.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'local-player-hand',
  templateUrl: './local-player-hand.component.html',
  styleUrls: ['./local-player-hand.component.css']
})
export class LocalPlayerHandComponent implements OnInit {


  public validCardsToPlay$: Observable<Card[]>;

  constructor(public player: HumanPlayerService, public game: WhistGameService) {

    this.validCardsToPlay$ = combineLatest(player.validCardsToPlay$, game.getTurnToPlayFor(player.getPlayer())).pipe(
      map(([validCards,ourTurn]) => ourTurn ? validCards : [])
    )

   }

  ngOnInit() {
  }

  public cardChosen(card: Card){
      this.player.playCard(card)
  }

}
