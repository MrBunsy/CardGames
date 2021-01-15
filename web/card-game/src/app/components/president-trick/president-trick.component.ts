import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from 'src/app/models/card';
import { PresidentGameService } from 'src/app/services/president-game.service';

@Component({
  selector: 'president-trick',
  templateUrl: './president-trick.component.html',
  styleUrls: ['./president-trick.component.css']
})
export class PresidentTrickComponent implements OnInit {
  public topCards$: Observable<Card[]>;
  constructor(private game: PresidentGameService) {
    this.topCards$ = game.getTrick().pipe(
      map(trick => {
        if (trick.cards.length == 0) {
          return [];
        }
        //find topmost actual cards, not a record of something passing
        for (let i = trick.cards.length - 1; i >= 0; i--) {
          if (trick.cards[i].cards.length > 0) {
            return trick.cards[i].cards;
          }
        }
        return [];
      })
    )
  }

  ngOnInit() {
  }

}
