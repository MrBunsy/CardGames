import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DeclarationWhistPlayer } from 'src/app/models/player';
import { GameService } from 'src/app/services/game.service';
import { Observable, Subscription } from 'rxjs';
import { Card } from 'src/app/models/card';
import { filter, map } from 'rxjs/operators';



class DrawableCard {
  public card: Card;
  public zIndex: number;
}

/**
 * Assumes: left, top, right, bottom, of players in order
 */
@Component({
  selector: 'active-trick',
  templateUrl: './active-trick.component.html',
  styleUrls: ['./active-trick.component.css']
})
export class ActiveTrickComponent implements OnInit, OnDestroy {

  //[left, top, right, bottom]
  // @Input() players: DeclarationWhistPlayer[];

  //left, top, right, bottom] null entries for no card
  public cards: DrawableCard[];

  private subs: Subscription[] = [];

  constructor(private game: GameService) {
    this.cards = [null, null, null, null];
    this.subs.push(this.game.getCurrentTrick().subscribe(
      trick => {
        this.cards = [null, null, null, null];
        // for (let i = 0; i < this.cards.length; i++) {
        //   this.cards[i] = null;
        // }
        if (trick != null && trick.winner == null) {
          let z = 0;
          for (let card of trick.cards) {
            this.cards[card.playerIndex] = { card: card.card, zIndex: z };
            z++;

          }
        }
      }
    ));
  }

  ngOnInit() {



  }

  ngOnDestroy(): void {
    for (let sub of this.subs) {
      sub.unsubscribe();
    }
    this.subs = [];
  }

}
