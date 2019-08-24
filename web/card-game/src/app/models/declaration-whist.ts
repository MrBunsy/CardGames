import { DeclarationWhistPlayer } from './player';
import { Deck } from './deck';

//long term plan to make this suitable for multiple games. for now, just write for declaration whist and tease apart later
//this is a stand in for the remote server
// export class DeclarationWhist{//} implements Game {

//     constructor(private deck: Card[], private players:DeclarationWhistPlayer[]){

//     }
// }


export class LocalDeclarationWhist { //implements IGame

    constructor(public players: DeclarationWhistPlayer[], private deck: Deck) {
        deck.deal(players);

    }

    // public usePlayers(players: DeclarationWhistPlayer[]) {

    // }
}