import { CardPlayer, DeclarationWhistPlayer } from './declaration-whist-player';
import { Deck } from './deck';
import { first } from 'rxjs/operators';
import { ReplaySubject, Observable } from 'rxjs';
import { Suit, Card } from './card';
import { CardsInTrickEventInfo, EventInfo, Game, GameEvent, IGame, Trick } from './game';

//long term plan to make this suitable for multiple games. for now, just write for declaration whist and tease apart later
//this is a stand in for the remote server

/**
 * Terminology is a bit wooly, but latest plan is:
 *  
 * A match lasts as long as the set of four players wants it to and is made up of multiple rounds
 * 
 * Each round starts with the deck dealt out and lasts for thirteen tricks
 * 
 * A running score is kept per match.
 * 
 * One DeclarationWhistGame object per match
 */



export class BidEventInfo extends EventInfo {
    public bid: number;
}


export class TrumpsEventInfo extends EventInfo {
    public suit: Suit;
}

export class TrickWonEventInfo extends EventInfo {
    //player in event info was the winner
}

export class ResultsEventInfo {
    public players: PlayerScores[];
}

export class PlayerScores {
    public bid: number = null;
    public tricksWon: number = 0;
    public score: number = 0;
    constructor(public player: DeclarationWhistPlayer, public index: number) { }
}

class PlayerInfo extends PlayerScores {


    public cards: number = 13;

    public nextRound() {
        this.bid = null;
        this.tricksWon = 0;
        this.cards = 13;
    }
}





export enum DeclarationWhistGameEventsType {
    Bid,
    Trumps,
    TrickOpened,
    CardPlayed,
    TrickWon,

}

export class DeclarationWhistEvent extends GameEvent {
    //turns out enums are a PITA in TS/angular
    constructor(public type: "MatchStart" | "Bid" | "Trumps" | "CardPlayed" | "TrickWon" | "MatchFinished",
        public eventInfo: BidEventInfo | TrumpsEventInfo | CardsInTrickEventInfo | EventInfo | ResultsEventInfo = null,
    ) {
        super(type, eventInfo, Game.DeclarationWhist);
    }
}

export class LocalDeclarationWhist implements IGame {

    public type = Game.DeclarationWhist;

    private playerInfos: PlayerInfo[] = [];
    private bids: BidEventInfo[] = [];
    private tricks: Trick[] = [];
    private trumps: Suit;

    //main interface for the world to watch the game
    public gameEvents: ReplaySubject<DeclarationWhistEvent> = new ReplaySubject<DeclarationWhistEvent>(10);

    public getGameEvents(): Observable<DeclarationWhistEvent> {
        return this.gameEvents.asObservable();
    }

    constructor(public players: DeclarationWhistPlayer[], private bidFirst: number, private verbose: boolean = false) {
        let i = 0;
        for (let player of this.players) {
            this.playerInfos.push(new PlayerInfo(player, i));
            i++;
        }

    }


    /**
     * Start a match. works for first match or next match
     */
    public start() {
        //reset various counters
        for (let player of this.playerInfos) {
            player.nextRound();
            //let any intelligent bots set up all their tracking
            player.player.startRound(this.players);
        }
        this.bids = [];
        this.tricks = [];
        this.trumps = null;
        let deck = new Deck();
        deck.deal(this.players);
        this.gameEvents.next(new DeclarationWhistEvent("MatchStart"));
        this.players[this.bidFirst].declareBid([]).pipe(first()).subscribe(
            bid => this.playerBid({ playerIndex: this.bidFirst, bid: bid, player: this.players[this.bidFirst] })
        )

    }

    private playerBid(bid: BidEventInfo) {
        if (this.verbose) {
            console.log("Player " + bid.playerIndex + " (" + bid.player.name + ") bid " + bid.bid);
        }
        this.playerInfos[bid.playerIndex].bid = bid.bid;
        this.gameEvents.next(new DeclarationWhistEvent("Bid", bid));
        this.bids.push(bid);

        if (this.bids.length != this.players.length) {
            let nextPlayer = (bid.playerIndex + 1) % this.players.length;
            this.playerInfos[nextPlayer].player.declareBid(this.bids).pipe(first()).subscribe(
                bid => this.playerBid({ bid: bid, player: this.players[nextPlayer], playerIndex: nextPlayer })
            )
        } else {
            if (this.verbose) {
                console.log("All bids in");
            }
            //erm, suppose we'd better start the game!

            //should work that the first of the highest bid gets trumps
            let highestBid = -1;
            let highestBidder: DeclarationWhistPlayer;
            for (let bid of this.bids) {
                if (bid.bid > highestBid) {
                    highestBid = bid.bid;
                    highestBidder = bid.player as DeclarationWhistPlayer;
                }
            }

            highestBidder.chooseTrumps(this.bids).pipe(first()).subscribe(trumps => this.trumpsChosen(trumps, highestBidder));


        }
    }

    private trumpsChosen(suit: Suit, player: DeclarationWhistPlayer) {
        this.trumps = suit;
        if (this.verbose) {
            console.log("Trumps are " + suit + ". Chosen by " + player.name);
        }

        let trumpsEvent: TrumpsEventInfo = { player: player, playerIndex: this.players.lastIndexOf(player), suit: suit };

        for (let player of this.players) {
            player.trumpsChosen(trumpsEvent);
        }
        this.gameEvents.next(new DeclarationWhistEvent("Trumps", trumpsEvent));
        this.startTrick(player);
    }

    private startTrick(player: DeclarationWhistPlayer) {
        if (this.verbose) {
            console.log("Trick started by " + player.name);
        }

        let lastTrick: Trick = null;
        if (this.tricks.length > 0) {
            lastTrick = this.tricks[this.tricks.length - 1];
        }

        this.tricks.push(new Trick(player));


        player.playCard([], lastTrick).pipe(first()).subscribe(card => this.playCard({ cards: [card], player: player, playerIndex: this.players.indexOf(player) }))
    }

    /**
     * player is playing a card on a trick.
     * @param card 
     */
    private playCard(card: CardsInTrickEventInfo) {
        if (this.verbose) {
            console.log(card.player.name + " played " + card.cards.toString());
        }

        this.playerInfos[card.playerIndex].cards--;

        let currentTrick = this.tricks[this.tricks.length - 1];
        currentTrick.cards.push(card);

        // this.emitTrick();

        this.gameEvents.next(new DeclarationWhistEvent("CardPlayed", card))

        if (currentTrick.cards.length < 4) {
            //more cards to play
            let nextPlayer = (card.playerIndex + 1) % this.players.length;
            let lastTrick: Trick = null;
            if (this.tricks.length > 1) {
                //top trick is current, one below is the previous round (if any)
                lastTrick = this.tricks[this.tricks.length - 2];
            }

            this.players[nextPlayer].playCard(currentTrick.cards, lastTrick).pipe(first()).subscribe(card => this.playCard({ cards: [card], player: this.players[nextPlayer], playerIndex: nextPlayer }))
        } else {
            this.endTrick();
        }

    }

    /**
     * I'm sure there's a proper way to do this
     * @param player 
     */
    private getPlayerInfo(player: DeclarationWhistPlayer) {
        for (let playerInfo of this.playerInfos) {
            if (playerInfo.player == player) {
                return playerInfo;
            }
        }
    }

    private endTrick() {
        if (this.verbose) {
            console.log("Trick ended");
        }

        let currentTrick = this.tricks[this.tricks.length - 1];


        let highestInSuit: CardsInTrickEventInfo = currentTrick.cards[0];
        let suit = highestInSuit.cards[0].suit;
        let highestTrump: CardsInTrickEventInfo = null


        //find highest card of the suit and/or highest trump
        for (let cardInTrick of currentTrick.cards) {
            if (cardInTrick.cards[0].suit == suit && cardInTrick.cards[0].value > highestInSuit.cards[0].value) {
                highestInSuit = cardInTrick;
            }
            if (cardInTrick.cards[0].suit == this.trumps && (highestTrump == null || cardInTrick.cards[0].value > highestTrump.cards[0].value)) {
                highestTrump = cardInTrick;
            }
        }

        let winner: DeclarationWhistPlayer;

        if (highestTrump != null) {
            winner = highestTrump.player as DeclarationWhistPlayer;
        } else {
            winner = highestInSuit.player as DeclarationWhistPlayer;
        }

        currentTrick.winner = winner;
        this.getPlayerInfo(winner).tricksWon++;
        if (this.verbose) {
            console.log(winner.name + " won the trick")
        }
        this.gameEvents.next(new DeclarationWhistEvent("TrickWon", { player: winner, playerIndex: this.players.indexOf(winner) }));

        if (this.tricks.length < 13) {
            this.startTrick(winner);
        } else {
            //round ended!
            this.endMatch();
        }
    }

    private endMatch() {
        if (this.verbose) {
            console.log("End of Match");
        }
        for (let player of this.playerInfos) {
            let score = player.tricksWon + (player.tricksWon == player.bid ? 10 : 0);
            player.score += score;
            if (this.verbose) {
                console.log(player.player.name + " bid " + player.bid + ", won " + player.tricksWon + " = " + score + " points");
            }
        }

        let topScore = 0;
        let winner: PlayerInfo;
        for (let player of this.playerInfos) {
            if (player.score > topScore) {
                topScore = player.score;
                winner = player;
            }
        }
        //set up the next round's first bidder
        let winnerIndex = this.playerInfos.indexOf(winner);
        this.bidFirst = winnerIndex;
        if (this.verbose) {
            console.log("Player " + winnerIndex + ": " + winner.player.name + " won the round");
        }

        this.gameEvents.next(new DeclarationWhistEvent("MatchFinished", { players: this.playerInfos }))
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



    // //bellow are useful gubbins for the GUI

    // public getPlayerCardCounts(): number[] {
    //     return this.playerInfos.map(info => info.cards);
    // }

    // public getPlayerTrickCounts(): number[] {
    //     return this.playerInfos.map(info => info.tricksWon);
    // }

    // public getCurrentTrick(): Trick {
    //     if (this.tricks.length > 0) {
    //         return this.tricks[this.tricks.length - 1];
    //     } else {
    //         return null;
    //     }
    // }

    // public getTricks(): Observable<Trick> {
    //     return this.trickEmitter.asObservable();
    // }
}