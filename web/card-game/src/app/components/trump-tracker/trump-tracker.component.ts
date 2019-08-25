import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { Suit, Card } from 'src/app/models/card';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'trump-tracker',
  templateUrl: './trump-tracker.component.html',
  styleUrls: ['./trump-tracker.component.css']
})
export class TrumpTrackerComponent implements OnInit {

  public suitCard$: Observable<Card>;
  public chooser$: Observable<string>;

  constructor(private game: GameService) {
    this.suitCard$ = this.game.getTrumpsEvent().pipe(
      map(event => event.suit),
      map(suit => new Card(suit, 0))
    );

    this.chooser$ = this.game.getTrumpsEvent().pipe(
      map(event => event.player.name)
    )
  }

  ngOnInit() {
  }

}
