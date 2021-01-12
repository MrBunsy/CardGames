import { Injectable } from '@angular/core';
import { IGame } from '../models/game';
import { LocalPresidentGame } from '../models/president';
import { PresidentPlayer } from '../models/PresidentPlayer';

@Injectable({
  providedIn: 'root'
})
export class PresidentGameService {

  private game: IGame;

  constructor() { }

  public createPresident(players: PresidentPlayer[], eventInterval: number = 1000, localPlayer: PresidentPlayer = null, verbose: boolean = false) {
    // this.tidyUpGame();

    this.game = new LocalPresidentGame(players);

  }
}
