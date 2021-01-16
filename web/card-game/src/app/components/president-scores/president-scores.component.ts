import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PresidentPlayer } from 'src/app/models/PresidentPlayer';
import { PresidentGameService } from 'src/app/services/president-game.service';

@Component({
  selector: 'president-scores',
  templateUrl: './president-scores.component.html',
  styleUrls: ['./president-scores.component.css']
})
export class PresidentScoresComponent implements OnInit {

  public players$: Observable<PresidentPlayer[]>
  constructor(private game: PresidentGameService) {
    this.players$ = game.getPlayers();
  }

  ngOnInit() {
  }

  public start() {
    this.game.start();
  }

}
