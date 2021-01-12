import { Component, OnInit } from '@angular/core';
import { WhistGameService } from 'src/app/services/game.service';
import { Observable } from 'rxjs';
import { ResultsEvent } from 'src/app/models/declaration-whist';

@Component({
  selector: 'total-scores',
  templateUrl: './total-scores.component.html',
  styleUrls: ['./total-scores.component.css']
})
export class TotalScoresComponent implements OnInit {

  public round$: Observable<number>;
  public scores$: Observable<ResultsEvent>;

  constructor(private game: WhistGameService) {
    this.round$ = this.game.getCurrentRound();
    this.scores$ = this.game.getCurrentScores();
  }

  public start(){
    this.game.start();
  }

  ngOnInit() {
  }

}
