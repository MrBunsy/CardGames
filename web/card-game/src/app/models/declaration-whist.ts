import { DeclarationWhistPlayer } from './player';
import { Deck } from './deck';
import { first } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

//long term plan to make this suitable for multiple games. for now, just write for declaration whist and tease apart later
//this is a stand in for the remote server
// export class DeclarationWhist{//} implements Game {

//     constructor(private deck: Card[], private players:DeclarationWhistPlayer[]){

//     }
// }

export class Bid {
    public player: DeclarationWhistPlayer;
    public bid: number;
}

class PlayerInfo {

    public bid: number = null;

    constructor(public player: DeclarationWhistPlayer, public index: number) { }
}

export class LocalDeclarationWhist { //implements IGame

    private playerInfos: PlayerInfo[] = [];

    public playerBids: ReplaySubject<Bid> = new ReplaySubject<Bid>();

    constructor(public players: DeclarationWhistPlayer[], private deck: Deck, private bidFirst: number) {
        let i = 0;
        for (let player of this.players) {
            this.playerInfos.push(new PlayerInfo(player, i));
            i++;
        }

    }

    public start() {
        this.deck.deal(this.players);
        this.players[this.bidFirst].declareBid([]).pipe(first()).subscribe(
            bid => this.playerBid(this.bidFirst, bid)
        )
    }

    // private gotAllBids(): boolean {
    //     let bids = 0;
    //     for (let player of this.playerInfos) {
    //         if (player.bid != null) {
    //             bids++;
    //         }
    //     }

    //     return bids == this.playerInfos.length;
    // }

    /**
     * [[playerIndex, bid]]
     */
    private getBids(): [number, number][] {

        let bids: [number, number][] = [];

        for (let player of this.getPlayersInOrder(this.bidFirst)) {
            if (player.bid == null) {
                break;
            }
            bids.push([player.index, player.bid]);
        }

        return bids;
    }

    private playerBid(playerIndex: number, bid: number) {
        console.log("Player " + playerIndex + " (" + this.players[playerIndex].name + ") bid " + bid);
        this.playerInfos[playerIndex].bid = bid;
        this.playerBids.next({ player: this.players[playerIndex], bid: bid });

        let bids = this.getBids();

        if (bids.length != this.players.length) {
            let nextPlayer = (playerIndex + 1) % this.players.length;
            this.playerInfos[nextPlayer].player.declareBid(bids).pipe(first()).subscribe(
                bid => this.playerBid(nextPlayer, bid)
            )
        } else {
            console.log("All bids in");
            //erm, suppose we'd better start the game!
        }
    }
    /**
     * Return an array of players in play order, starting at player index startAt
     * @param startAt 
     */
    private getPlayersInOrder(startAt: number): PlayerInfo[] {
        let players = this.playerInfos.slice();

        for (let i = 0; i < startAt; i++) {
            players.push(players.shift());
        }

        return players;
    }

    // public usePlayers(players: DeclarationWhistPlayer[]) {

    // }
}