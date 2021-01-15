import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PresidentPlayer } from 'src/app/models/PresidentPlayer';
import { PresidentGameService } from 'src/app/services/president-game.service';

@Component({
  selector: 'president-table',
  templateUrl: './president-table.component.html',
  styleUrls: ['./president-table.component.css']
})
export class PresidentTableComponent implements OnInit {

  public players$: Observable<PresidentPlayer[]>;
  public openHand = false;

  constructor(private game: PresidentGameService) {
    this.players$ = game.getPlayers();
    
  }

  ngOnInit() {
  }

}
