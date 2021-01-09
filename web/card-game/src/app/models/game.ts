import { Observable } from 'rxjs';

export enum Game {
    DeclarationWhist,
    President
}

export class GameEvent{
    constructor(public type: string,
    public event: any,
    public game: Game){}

}

export interface IGame {
    getGameEvents(): Observable<GameEvent>;
    start();
    type: Game;
}


