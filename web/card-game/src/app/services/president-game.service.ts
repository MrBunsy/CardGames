import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameEvent, IGame } from '../models/game';
import { LocalPresidentGame } from '../models/president';
import { PresidentPlayer } from '../models/PresidentPlayer';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class PresidentGameService extends GameService {
  //the state of players as known from tracking game events
  // private players: PresidentPlayer[];
  // private playerStateChanged: Subject<boolean> = new Subject<boolean>();

  constructor() {
    super();
  }

  public createPresident(players: PresidentPlayer[], eventInterval: number = 1000, localPlayer: PresidentPlayer = null, verbose: boolean = false) {
    // this.tidyUpGame();

    this.players = players;
    // this.players$.next(players);
    this.game = new LocalPresidentGame(players);

    this.subscribetoGame();

  }


  public getPlayers(): Observable<PresidentPlayer[]> {
    //TODO create game staet of players from game events
    return this.gameEventsOut$.asObservable().pipe(map(() => this.players as PresidentPlayer[]));
  }

  protected processGameEvent(event: GameEvent) {

    switch(event.type){
      
    }

    //override this
    this.gameEventsOut$.next(event);
  }
  protected isEventFromLocalPlayer(event: GameEvent): boolean {
    //override this
    return false;
  }
}
