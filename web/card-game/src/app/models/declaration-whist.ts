import { DeclarationWhistPlayer } from './player';
import { Deck } from './deck';
import { first } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { Suit, Card } from './card';

//long term plan to make this suitable for multiple games. for now, just write for declaration whist and tease apart later
//this is a stand in for the remote server
// export class DeclarationWhist{//} implements Game {

//     constructor(private deck: Card[], private players:DeclarationWhistPlayer[]){

//     }
// }

export class EventInfo {
    public player: DeclarationWhistPlayer;
    public playerIndex: number;
}

export class Bid extends EventInfo {
    public bid: number;
}

export class CardInTrick extends EventInfo {
    public card: Card;
}
export class Trumps extends EventInfo {
    public suit: Suit;
}

// export class TrickInfo{
//     public player: DeclarationWhistPlayer;
// }

class PlayerInfo {

    public bid: number = null;

    constructor(public player: DeclarationWhistPlayer, public index: number) { }
}

class Trick {
    constructor(public openedBy: DeclarationWhistPlayer) { }
    public cards: CardInTrick[] = [];
}

export enum DeclarationWhistGameEventsType {
    Bid,
    Trumps,
    TrickOpened,
    CardPlayed,
    TrickWon,

}

export class DeclarationWhistGameEvents {
    // public type: DeclarationWhistGameEventsType;
    //turns out enums are a PITA in TS/angular
    public type: "Bid" | "Trumps" | "TrickStart" | "CardPlayed" | "TrickWon";
    public event: Bid | Trumps | CardInTrick;
}

export class LocalDeclarationWhist { //implements IGame

    private playerInfos: PlayerInfo[] = [];
    private bids: Bid[] = [];
    private tricks: Trick[] = [];
    private trumps: Suit;

    // public playerBids: ReplaySubject<Bid> = new ReplaySubject<Bid>();
    public gameEvents: ReplaySubject<DeclarationWhistGameEvents> = new ReplaySubject<DeclarationWhistGameEvents>(1);

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
            bid => this.playerBid({ playerIndex: this.bidFirst, bid: bid, player: this.players[this.bidFirst] })
        )
    }

    private playerBid(bid: Bid) {
        console.log("Player " + bid.playerIndex + " (" + bid.player.name + ") bid " + bid);
        this.playerInfos[bid.playerIndex].bid = bid.bid;
        this.gameEvents.next({ type: "Bid", event: bid });
        this.bids.push(bid);

        if (this.bids.length != this.players.length) {
            let nextPlayer = (bid.playerIndex + 1) % this.players.length;
            this.playerInfos[nextPlayer].player.declareBid(this.bids).pipe(first()).subscribe(
                bid => this.playerBid({ bid: bid, player: this.players[nextPlayer], playerIndex: nextPlayer })
            )
        } else {
            console.log("All bids in");
            //erm, suppose we'd better start the game!

            //should work that the first of the highest bid gets trumps
            let highestBid = -1;
            let highestBidder: DeclarationWhistPlayer;
            for (let bid of this.bids) {
                if (bid.bid > highestBid) {
                    highestBid = bid.bid;
                    highestBidder = bid.player;
                }
            }

            highestBidder.chooseTrumps().pipe(first()).subscribe(trumps => this.trumpsChosen(trumps, highestBidder));


        }
    }

    private trumpsChosen(suit: Suit, player: DeclarationWhistPlayer) {
        this.trumps = suit;
        console.log("Trumps are " + suit + ". Chosen by " + player.name);
        this.gameEvents.next({ type: "Trumps", event: { player: player, playerIndex: this.players.lastIndexOf(player), suit: suit } })
        this.startTrick(player);
    }

    private startTrick(player: DeclarationWhistPlayer) {
        console.log("Trick started by " + player.name);

        this.tricks.push(new Trick(player));

        player.playCard([]).pipe(first()).subscribe(card => this.playCard({ card: card, player: player, playerIndex: this.players.indexOf(player) }))
    }

    /**
     * player is playing a card on a trick.
     * @param card 
     */
    private playCard(card: CardInTrick) {
        console.log(card.player.name + " played " + card.card.toString());
        this.gameEvents.next({ type: "CardPlayed", event: card })

        let currentTrick = this.tricks[this.tricks.length - 1];

        currentTrick.cards.push(card);

        if (currentTrick.cards.length < 4) {
            //more cards to play
            let nextPlayer = (card.playerIndex + 1) % this.players.length;

            this.players[nextPlayer].playCard(currentTrick.cards).pipe(first()).subscribe(card => this.playCard({ card: card, player: this.players[nextPlayer], playerIndex: nextPlayer }))
        } else {
            this.endTrick();
        }

    }

    private endTrick() {
        console.log("Trick ended");

        let currentTrick = this.tricks[this.tricks.length - 1];


        let highestInSuit: CardInTrick = currentTrick.cards[0];
        let suit = highestInSuit.card.suit;
        let highestTrump: CardInTrick = null


        //find highest card of the suit and/or highest trump
        for (let cardInTrick of currentTrick.cards) {
            if (cardInTrick.card.suit == suit && cardInTrick.card.value > highestInSuit.card.value) {
                highestInSuit = cardInTrick;
            }
            if (cardInTrick.card.suit == this.trumps && (highestTrump == null || cardInTrick.card.value > highestTrump.card.value)) {
                highestTrump = cardInTrick;
            }
        }

        let winner: DeclarationWhistPlayer;

        if (highestTrump != null) {
            winner = highestTrump.player;
        } else {
            winner = highestInSuit.player;
        }

        console.log(winner.name + " won the trick")

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
}