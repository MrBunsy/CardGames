import { Component, OnInit, Input } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DeclarationWhistPlayer } from 'src/app/models/player';
import { Observable } from 'rxjs';

@Component({
  selector: 'bid-tracker',
  templateUrl: './bid-tracker.component.html',
  styleUrls: ['./bid-tracker.component.css']
})
export class BidTrackerComponent implements OnInit {

  @Input() player: DeclarationWhistPlayer;
  public bid$: Observable<number>;
  public won$: Observable<number>;

  constructor(private game: GameService) {

  }

  ngOnInit() {
    this.bid$ = this.game.getBidsFor(this.player);
    this.won$ = this.game.getTricksWonFor(this.player);
  }

}
