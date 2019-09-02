import { Component, OnInit, Input } from '@angular/core';
import { DeclarationWhistPlayer } from 'src/app/models/player';
import { Observable, merge, combineLatest, of } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { PlayerState, HumanPlayerService } from 'src/app/services/human-player.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'card-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input() players: DeclarationWhistPlayer[];
  @Input() humanPlayerIndex: number = -1;

  public roundRunning$: Observable<boolean>;

  public playerPositions: string[] = ["left", "top", "right", "bottom"];

  public showTrick$: Observable<boolean>;
  public showBids$: Observable<boolean>;
  public showTrumps$: Observable<boolean>;
  public validBids$: Observable<number[]>;

  constructor(private game: GameService, private player: HumanPlayerService) {
    this.roundRunning$ = this.game.getRoundInProgress();
    // this.playerState$ = player.playerState$.asObservable();
    this.validBids$ = this.player.validBids$.asObservable();
  }

  ngOnInit() {
    if (this.humanPlayerIndex < 0) {
      //no human player, so no-one to choose bids and trumps
      this.showTrick$ = this.roundRunning$;
      this.showBids$ = of(false);
      this.showTrumps$ = of(false);
    } else {
      this.showTrick$ = combineLatest(this.roundRunning$, this.player.playerState$.asObservable()).pipe(
        map(([roundRunning, playerState]) => roundRunning && (playerState != "ChoosingBid" && playerState != "ChoosingTrumps"))
      )
      this.showBids$ = this.player.playerState$.asObservable().pipe(
        map(state => state == "ChoosingBid")
      )

      this.showTrumps$ = this.player.playerState$.asObservable().pipe(
        map(state => state == "ChoosingTrumps")
      )
    }
  }

}
