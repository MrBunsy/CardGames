import { Observable } from 'rxjs';
import { Card } from './card';
import { CardPlayer } from './declaration-whist-player';

export enum Game {
    DeclarationWhist,
    President
}

export class GameEvent{
    constructor(public type: string,
    public eventInfo: any,
    public game: Game){}

}

export interface IGame {
    getGameEvents(): Observable<GameEvent>;
    start();
    type: Game;
}


export class Trick {
    constructor(public openedBy: CardPlayer) { }
    public cards: CardsInTrickEventInfo[] = [];
    public winner: CardPlayer = null;
}

export class EventInfo {
    public player: CardPlayer;
    public playerIndex: number;
}
export class CardsInTrickEventInfo extends EventInfo {
    // public card: Card[];
    //whist only ever has one card per player per trick, but other games can have more
    constructor(public cards: Card[], public player: CardPlayer, public playerIndex) {
        super();
    }
}