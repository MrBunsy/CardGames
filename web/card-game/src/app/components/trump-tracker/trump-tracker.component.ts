import { Component, OnInit } from '@angular/core';
import { WhistGameService } from 'src/app/services/game.service';
import { Suit, Card } from 'src/app/models/card';
import { Observable } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';

@Component({
  selector: 'trump-tracker',
  templateUrl: './trump-tracker.component.html',
  styleUrls: ['./trump-tracker.component.css']
})
export class TrumpTrackerComponent implements OnInit {

  public suitCard$: Observable<Card>;
  public chooser$: Observable<string>;

  constructor(private game: WhistGameService) {
    this.suitCard$ = this.game.getTrumpsEvent().pipe(
      map(event => {
        if (event) {
          return new Card(event.suit, 0)
        } else {
          return null;
        }
      }),
    );

    this.chooser$ = this.game.getTrumpsEvent().pipe(
      filter(event => event != null),
      map(event => event.player.name)
    )
  }

  ngOnInit() {
  }

}
