import { DeclarationWhistPlayer } from './player';
import { Card, Suit, suitArray } from './card';
import { ReplaySubject, Observable, of } from 'rxjs';
import { TrumpsEvent, BidEvent, CardInTrickEvent, Trick } from './declaration-whist';
import { Deck } from './deck';

//three different versions of this now... oops
class PlayerInfo {
    public playedCards: Card[];
    public bid: number;
    public choseTrumps: boolean;
    public tricksWon: number;

    constructor(public player: DeclarationWhistPlayer) {
        this.playedCards = [];
        this.tricksWon = 0;
    }

}

export class CleverBot implements DeclarationWhistPlayer {
    private cards: Card[];
    private startingCards: Card[];
    //what are trumps, and who chose them?
    private trumps: TrumpsEvent;
    //track what other players have played
    // private otherPlayersPlayed: Map<DeclarationWhistPlayer, Card[]>;
    private allPlayers: PlayerInfo[];

    constructor(public name: string) { }

    public startRound(allPlayers: DeclarationWhistPlayer[]) {
        //reset everything we're tracking
        // this.otherPlayersPlayed = new Map<DeclarationWhistPlayer, Card[]>();
        // for (let player of allPlayers) {
        //     this.otherPlayersPlayed.set(player, []);
        // }
        this.allPlayers = [];
        for (let player of allPlayers) {
            this.allPlayers.push(new PlayerInfo(player));
        }
    }

    public dealHand(cards: Card[]) {
        this.cards = cards;
        //make a copy
        this.startingCards = cards.slice();

    }

    public trumpsChosen(trumps: TrumpsEvent) {
        this.trumps = trumps;
        this.allPlayers[trumps.playerIndex].choseTrumps = true;
    }

    /**
     * in ideal circumstances, how many tricks do we think we can win?
     */
    private preferedBid(otherBids: BidEvent[]): number {
        /**
         * Inputs: other bids, our cards
         * Considerations: trumps, starting first
         */

        let sorted: Map<Suit, Card[]> = Deck.getCardsInSuits(this.cards);

        //random guess!
        return Math.round(Math.random() * 13);

    }

    /**
     * Get our estimated number of tricks
     */
    public declareBid(otherBids: BidEvent[]): Observable<number> {

        let preferedTrickEstimate = this.preferedBid(otherBids);

        if (otherBids.length == 3) {
            //must ensure we choose a valid count
            let totalTrickEstimates = otherBids.map(estimate => estimate[1]).reduce((sum, current) => sum + current);

            if (preferedTrickEstimate + totalTrickEstimates == 13) {
                //can't have this estimate, let's ... uh subtract one for now
                return of(preferedTrickEstimate - 1);
            }

        }

        return of(preferedTrickEstimate);

    }

    /**
     * This player's estimate was highest, they get to choose trumps
     */
    public chooseTrumps(otherBids: BidEvent[]): Observable<Suit> {
        for (let bid of otherBids) {
            this.allPlayers[bid.playerIndex].bid = bid.bid;
        }
        let trumps: Suit = "Clubs";
        let highestCount = 0;

        //choose suit with most cards
        let count = Deck.getSuitCount(this.cards);
        for (let suit of suitArray) {
            if (count[suit] > highestCount) {
                highestCount = count[suit];
                trumps = suit;
            }
        }

        return of(trumps);

    }

    /**
     * Get our card for a trick
     * @param trick array of tupes of who (player index) played what
     */
    public playCard(trick: CardInTrickEvent[], previousTrick: Trick): Observable<Card> {

        if (previousTrick != null) {
            //update all our tracking of whatnot
            for (let card of previousTrick.cards) {
                this.allPlayers[card.playerIndex].playedCards.push(card.card);
            }
            let winnerIndex = this.allPlayers.findIndex(player => player.player == previousTrick.winner);
            this.allPlayers[winnerIndex].tricksWon++;
        }

        let cardIndex = 0;
        let validCards = this.cards.slice();

        if (trick.length > 0) {
            //have to follow suit if we can
            let suit = trick[0].card.suit;
            let sortedCards = Deck.getCardsInSuits(this.cards);
            if (sortedCards[suit].length > 0) {
                validCards = sortedCards[suit].slice();
            } //else can't follow suit
        }//else we play first

        let card = validCards[cardIndex];

        this.cards.splice(cardIndex, 1);
        return of(card);

    }
}
