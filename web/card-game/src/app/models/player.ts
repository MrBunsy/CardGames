import { Card, Suit, suitArray } from './card';
import { Game } from './game';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { Bid, CardInTrick, Trumps } from './declaration-whist';
import { tap, map } from 'rxjs/operators';

export interface CardPlayer {
    dealHand(cards: Card[]);
}

export interface DeclarationWhistPlayer extends CardPlayer {

    name: string;

    // getCards(): Observable<Card[]>;
    // getBid(): Observable<number>;

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

    //emitted when dealt a hand, and every time your hand changes
    public cards$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);

    private cards: Card[];

    private bidOutput$: ReplaySubject<number> = new ReplaySubject<number>(1);

    //emitted when we need to bid
    public validBids$: Subject<number[]> = new Subject<number[]>();
    //emitted if we need to choose trumps
    public chooseTrumps$: Subject<void> = new Subject<void>();
    //emitted when we need to play a card
    public validCardsToPlay$: Subject<Card[]> = new Subject<Card[]>();

    private trumps: Suit;

    constructor(
        public name: string,
        private bidInput$: Observable<number>,
        private trumps$: Observable<Suit>,
        private playCard$: Observable<Card>
    ) { }

    dealHand(cards: Card[]) {
        this.cards$.next(cards);
        this.cards = cards;
    }

    // public getCards(): Observable<Card[]> {
    //     return this.cards$.asObservable();
    // }

    public getBid(): Observable<number>{
        return this.bidOutput$.asObservable();
    }

    //game is requesting our bid
    declareBid(otherEstimates: Bid[]): Observable<number> {

        let validBids = [];
        let totalTrickEstimates = 0;
        if (otherEstimates.length == 3) {
            totalTrickEstimates = otherEstimates.map(estimate => estimate[1]).reduce((sum, current) => sum + current);
        }

        //must ensure we choose a valid count

        for (let i = 0; i <= 13; i++) {
            if (i + totalTrickEstimates != 13) {
                validBids.push(i);
            }
        }
        this.validBids$.next(validBids);
        return this.bidInput$.pipe(
            tap(bid => this.bidOutput$.next(bid))
        );
    }

    /**
     * Used by the game
     */
    chooseTrumps(): Observable<Suit> {
        this.chooseTrumps$.next();

        return this.trumps$;
    }


    private removeCard(card: Card) {
        let index: number = this.cards.findIndex(thisCard => thisCard.equals(card));
        this.cards.splice(index, 1);
        this.cards$.next(this.cards);
    }

    playCard(trick: CardInTrick[]): Observable<Card> {
        let validCards = this.cards.slice();
        if (trick.length > 0) {
            //suit to follow
            let followSuit = trick[0].card.suit;
            let suitCount = Card.getCardsInSuits(this.cards);

            if (suitCount[followSuit].length > 0) {
                //have to follow suit
                validCards = suitCount[followSuit];
            }
        }

        this.validCardsToPlay$.next(validCards);
        return this.playCard$.pipe(
            tap(cardPlayed => this.removeCard(cardPlayed))
        );
    }


}

/**
 * The Moron will play valid, but random, cards and choices
 */
export class Moron implements DeclarationWhistPlayer {

    private cards: Card[];
    private cards$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);

    constructor(public name: string) { }

    public dealHand(cards: Card[]) {
        this.cards = cards;
        this.cards$.next(cards);
    }

    public trumpsChosen(trumps: Trumps) {
        //moron is too dumb to care
    }

    // public getCards(): Observable<Card[]> {
    //     return this.cards$.asObservable();
    //     // .pipe(
    //     //     //replace with face-down cards
    //     //     map(cards => cards.map(card => new Card(null, 0, false)))
    //     // );
    // }

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

        let trumps: Suit = "Clubs";
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
        this.cards$.next(this.cards);
        return of(card);

    }
}
