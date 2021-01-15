import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from 'src/app/models/card';
import { PresidentPlayer } from 'src/app/models/PresidentPlayer';
import { PresidentGameService } from 'src/app/services/president-game.service';

@Component({
  selector: 'remote-player-hand-president',
  templateUrl: './remote-player-hand-president.component.html',
  styleUrls: ['./remote-player-hand-president.component.css']
})
export class RemotePlayerHandPresidentComponent implements OnChanges {//, OnDestroy {

  private subs: Subscription[] = [];

  @Input() player: PresidentPlayer;
  @Input() openHand: boolean;

  public cards$: Observable<Card[]>;

  constructor(private game: PresidentGameService) {

  }

  ngOnChanges(changes: SimpleChanges) {
    //seems like I need the array to be a whole new array to get the change detection of the cards component to work. fine. meh.
    this.cards$ = this.game.getPlayers().pipe(
      map(players => {
        for(let player of players){
          if (player == this.player){
            return [...player.cards];
          }
        }
        return this.player.cards;
      })
    );

  }

}
