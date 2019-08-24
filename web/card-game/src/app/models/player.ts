import { Card, Suit, suitArray } from './card';
import { Game } from './game';
import { Observable, of } from 'rxjs';
import { Bid, CardInTrick } from './declaration-whist';

export interface CardPlayer {
    dealHand(cards: Card[]);
}

export interface DeclarationWhistPlayer extends CardPlayer {

    name: string;
    /**
     * Get our estimated number of tricks
     * @param otherEstimates estimates of the preceeding players, in order. array of tuples of player index and esimate [(0, 13), (1,10)]
     */
    declareBid(otherEstimates: Bid[]): Observable<number>;

    /**
     * This player's bid was highest, they get to choose trumps
     */
    chooseTrumps(): Observable<Suit>;

    /**
     * Get our card for a trick
     * @param trick array of tupes of who (player index) played what
     */
    playCard(trick: CardInTrick[]): Observable<Card>;
}

export class LocalHuman implements DeclarationWhistPlayer {

    public name: string;

    dealHand(cards: Card[]) {
        // throw new Error("Method not implemented.");
    }
    declareBid(otherEstimates: Bid[]): Observable<number> {
        throw new Error("Method not implemented.");
    }
    chooseTrumps(): Observable<Suit> {
        throw new Error("Method not implemented.");
    }
    playCard(trick: CardInTrick[]): Observable<Card> {
        throw new Error("Method not implemented.");
    }


}

export class Moron implements DeclarationWhistPlayer {

    private cards: Card[];

    constructor(public name: string) { }

    public dealHand(cards: Card[]) {
        this.cards = cards;
    }



    /**
     * in ideal circumstances, how many tricks do we think we can win?
     */
    private preferedTrickEstimate(): number {

        let suitCount = Card.getSuitCount(this.cards);

        //random guess!
        return Math.round(Math.random() * 13);

    }

    /**
     * Get our estimated number of tricks
     * @param otherEstimates estimates of the preceeding players, in order. array of tuples of player index and esimate [(0, 13), (1,10)]
     */
    public declareBid(otherEstimates: Bid[]): Observable<number> {

        let preferedTrickEstimate = this.preferedTrickEstimate();

        if (otherEstimates.length == 3) {
            //must ensure we choose a valid count
            let totalTrickEstimates = otherEstimates.map(estimate => estimate[1]).reduce((sum, current) => sum + current);

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
    public chooseTrumps(): Observable<Suit> {

        let trumps = Suit.Club;
        let highestCount = 0;

        //choose suit with most cards
        let count = Card.getSuitCount(this.cards);
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
    public playCard(trick: CardInTrick[]): Observable<Card> {

        let cardIndex = 0;

        if (trick.length == 0) {
            //we play first
            cardIndex = Math.floor(Math.random() * this.cards.length);
        } else {
            //have to follow suit if we can
            let suit = trick[0].card.suit;
            let sortedCards = Card.getCardsInSuits(this.cards);
            if (sortedCards[suit].length > 0) {
                let wantCard = sortedCards[suit][Math.floor(Math.random() * sortedCards[suit].length)];
                cardIndex = this.cards.lastIndexOf(wantCard);
            } else {
                //can't follow suit
                cardIndex = Math.floor(Math.random() * this.cards.length);
            }
        }

        let card = this.cards[cardIndex];

        this.cards.splice(cardIndex, 1);

        return of(card);

    }
}
