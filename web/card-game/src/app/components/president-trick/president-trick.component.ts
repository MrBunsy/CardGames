import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from 'src/app/models/card';
import { Trick } from 'src/app/models/game';
import { DeckService } from 'src/app/services/deck.service';
import { PresidentGameService } from 'src/app/services/president-game.service';

@Component({
  selector: 'president-trick',
  templateUrl: './president-trick.component.html',
  styleUrls: ['./president-trick.component.css']
})
export class PresidentTrickComponent implements OnInit {
  public trickCards$: Observable<Card[][]>;
  public style: string;
  constructor(private game: PresidentGameService, private deck: DeckService) {
    this.style = deck.getStyle();
    this.trickCards$ = game.getTrick().pipe(
      map(trick => trick == null ? new Trick(null) : trick),
      //just get the plays in the trick that weren't passes
      map(trick => trick.cards.filter(trick => trick.cards.length > 0)),
      map(trick => trick.map(trick => trick.cards))
    )
  }

  ngOnInit() {
  }

}
