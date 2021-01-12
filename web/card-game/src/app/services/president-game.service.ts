import { Injectable } from '@angular/core';
import { IGame } from '../models/game';
import { LocalPresidentGame } from '../models/president';
import { PresidentPlayer } from '../models/PresidentPlayer';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class PresidentGameService extends GameService {

  constructor() {
    super();
  }

  public createPresident(players: PresidentPlayer[], eventInterval: number = 1000, localPlayer: PresidentPlayer = null, verbose: boolean = false) {
    // this.tidyUpGame();

    this.players = players;
    this.game = new LocalPresidentGame(players);

  }
}
