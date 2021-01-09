import { Component, OnInit, Input } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { DeclarationWhistPlayer } from 'src/app/models/declaration-whist-player';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'bid-tracker',
  templateUrl: './bid-tracker.component.html',
  styleUrls: ['./bid-tracker.component.css']
})
export class BidTrackerComponent implements OnInit {

  @Input() player: DeclarationWhistPlayer;
  public bid$: Observable<string>;
  public won$: Observable<number>;

  constructor(private game: GameService) {

  }

  ngOnInit() {
    //bodge, make a string so we don't accidentally ignore bids of 0 (js treats 0 as false)
    this.bid$ = this.game.getBidsFor(this.player).pipe(
      map(bid => bid !=null ? bid+"" : null)
      );
    this.won$ = this.game.getTricksWonFor(this.player);
  }

}
