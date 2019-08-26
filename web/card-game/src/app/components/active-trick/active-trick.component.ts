import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DeclarationWhistPlayer } from 'src/app/models/player';
import { GameService } from 'src/app/services/game.service';
import { Observable, Subscription } from 'rxjs';
import { Card } from 'src/app/models/card';
import { filter, map } from 'rxjs/operators';





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
  public cards: Card[];
  //card at the bottom of the trick
  public first: number;

  private subs: Subscription[] = [];

  constructor(private game: GameService) {
    this.cards = [null, null, null, null];
    this.subs.push(this.game.getCurrentTrick().subscribe(
      trick => {
        this.cards = [null, null, null, null];
        let foundFirst: boolean = false;
        //if four cards, then this trick has been won
        if (trick != null && trick.winner == null) {//trick.cards.length < 4
          for (let card of trick.cards) {
            if (!foundFirst) {
              this.first = card.playerIndex;
              foundFirst = true;
            }
            this.cards[card.playerIndex] = card.card;
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
