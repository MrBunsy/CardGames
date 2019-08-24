import { Card } from './card';
import { DeclarationWhistPlayer } from './player';

export enum Game {
    DeclarationWhist
}

export interface IGame {

    // useDeck: (desk: Card[]) => void;
    usePlayers: (players: DeclarationWhistPlayer[]) => void;
}


