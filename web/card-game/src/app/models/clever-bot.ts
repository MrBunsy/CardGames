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

    private tricksWon: number;
    private bid: number;

    constructor(public name: string) { }

    public startRound(allPlayers: DeclarationWhistPlayer[]) {
        //reset everything we're tracking
        // this.otherPlayersPlayed = new Map<DeclarationWhistPlayer, Card[]>();
        // for (let player of allPlayers) {
        //     this.otherPlayersPlayed.set(player, []);
        // }
        this.allPlayers = [];
        this.tricksWon = 0;
        this.bid = 0;
        for (let player of allPlayers) {
            this.allPlayers.push(new PlayerInfo(player));
        }
    }

    public dealHand(cards: Card[]) {
        this.cards = Deck.sort(cards, true);
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

        let wantBid = this.preferedBid(otherBids);

        if (otherBids.length == 3) {
            //must ensure we choose a valid count
            let totalTrickEstimates = otherBids.map(estimate => estimate[1]).reduce((sum, current) => sum + current);

            if (wantBid + totalTrickEstimates == 13) {
                //can't have this estimate, let's ... uh subtract one for now
                //TODO decide waht's best based on the other players' bids
                wantBid--;
            }

        }

        this.bid = wantBid;

        return of(wantBid);

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
    private ourBestTrump(): Card {
        let ourTrumps = this.cards.filter(card => card.suit == this.trumps.suit);
        if (ourTrumps.length == 0) {
            return null;
        }
        //relying on our cards being sorted
        return ourTrumps[ourTrumps.length - 1];
    }

    /**
     * Best guess at winning by playing a specific card
     * @param card 
     */
    private probablityToWinTrick(card: Card):number{
        return 0;
    }

    /**
     * How much is this card worth, taking into account what we know of the game?
     * Intended to work out which card to get rid of when we can't or don't want to win
     * @param card 
     */
    private probableValueOfCard(card: Card): number{
        return 0;
    }

    /**
     * Simplistic test for possible to win the trick, if no-one else plays to beat us
     * @param trick 
     */
    private possibleToWin(trick: CardInTrickEvent[]): boolean {
        let validCards = this.cards.slice();

        let trumped = false;
        for (let card of trick.map(trick => trick.card)) {
            if (card.suit == this.trumps.suit) {
                trumped = true;
                break;
            }
        }

        let followingSuit = true;
        let trickSuit: Suit;

        if (trick.length > 0) {
            //have to follow suit if we can
            trickSuit = trick[0].card.suit;
            let sortedCards = Deck.getCardsInSuits(this.cards);
            if (sortedCards[trickSuit].length > 0) {
                validCards = sortedCards[trickSuit].slice();
            } else {
                followingSuit = false;
            }
        }//else we play first

        if (followingSuit) {
            if (trumped && trickSuit != this.trumps.suit) {
                //we have to follow suit, but someone else has trumped it.
                return false;
            }
            //do we have a high enough card?
            let ourHighestCard = validCards[validCards.length - 1];
            //sorted list of cards that could win the trick
            let relevantTrickCards: Card[] = Deck.sort(trick.map(trick => trick.card).filter(card => card.suit == trickSuit || card.suit == this.trumps.suit));

            //our best card is better than the current best card
            return relevantTrickCards[relevantTrickCards.length - 1].value < ourHighestCard.value;

        } else {
            let ourBestTrump = this.ourBestTrump();
            //do we have a (high enough) trump?
            if (ourBestTrump == null) {
                //we don't have any trumps
                return false;
            }
            let trumpsInTrick = Deck.sort(trick.map(trick => trick.card).filter(card => card.suit == this.trumps.suit));

            if (trumpsInTrick.length == 0) {
                return true;
            }
            return trumpsInTrick[trumpsInTrick.length - 1].value < ourBestTrump.value;

        }
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

        let trumped = false;
        for (let card of trick.map(trick => trick.card)) {
            if (card.suit == this.trumps.suit) {
                trumped = true;
                break;
            }
        }

        let wantToWin = this.tricksWon < this.bid;
        let followingSuit = true;

        if (trick.length > 0) {
            //have to follow suit if we can
            let suit = trick[0].card.suit;
            let sortedCards = Deck.getCardsInSuits(this.cards);
            if (sortedCards[suit].length > 0) {
                validCards = sortedCards[suit].slice();
            } else {
                followingSuit = false;
            }
        }//else we play first

        if (wantToWin && (followingSuit || !followingSuit && !trumped)) {
            //we have a chance to win this trick
        }

        let card = validCards[cardIndex];

        this.cards.splice(cardIndex, 1);
        return of(card);

    }
}
