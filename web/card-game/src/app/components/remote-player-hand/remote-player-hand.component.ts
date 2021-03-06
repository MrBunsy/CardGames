import { Component, OnInit, Input } from '@angular/core';
import { DeclarationWhistPlayer } from 'src/app/models/declaration-whist-player';
import { Observable } from 'rxjs';
import { Card } from 'src/app/models/card';
import { map } from 'rxjs/operators';
import { WhistGameService } from 'src/app/services/game.service';

@Component({
  selector: 'remote-player-hand',
  templateUrl: './remote-player-hand.component.html',
  styleUrls: ['./remote-player-hand.component.css']
})
export class RemotePlayerHandComponent implements OnInit {

  @Input() player: DeclarationWhistPlayer;
  @Input() vertical: boolean = false;
  @Input() openHand: boolean = false;

  public cards$: Observable<Card[]>;

  constructor(private game: WhistGameService) { }

  ngOnInit() {
    // if (this.openHand) {
    //   this.cards$ = this.game.getCardsFor(this.player);
    // } else {
      this.cards$ = this.game.getCardCountFor(this.player).pipe(
        //replace with face-down cards
        map(count => {
          let cards = [];
          for (let i = 0; i < count; i++) {
            cards.push(new Card(null, null, false));
          }
          return cards;
        })
      );
    }
  // }

}
