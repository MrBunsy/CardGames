import { Card, Suit, suitArray } from './card';
import { CardsInTrickEventInfo, Game, Trick } from './game';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { BidEventInfo, TrumpsEventInfo} from './declaration-whist';
import { tap, map } from 'rxjs/operators';
import { Deck } from './deck';

export interface CardPlayer {
    dealHand(cards: Card[]);
    name: string;
}

export interface DeclarationWhistPlayer extends CardPlayer {

    

    startRound(allPlayers: DeclarationWhistPlayer[]);

    /**
     * Get our estimated number of tricks
     * @param otherEstimates estimates of the preceeding players, in order. array of tuples of player index and esimate [(0, 13), (1,10)]
     */
    declareBid(otherEstimates: BidEventInfo[]): Observable<number>;

    /**
     * This player's bid was highest, they get to choose trumps
     */
    chooseTrumps(otherBids: BidEventInfo[]): Observable<Suit>;

    /**
     * Inform player of trumps and who chose
     * @param trumps 
     */
    trumpsChosen(trumps: TrumpsEventInfo);

    /**
     * Get our card for a trick
     * @param trick array of tupes of who (player index) played what
     */
    playCard(trick: CardsInTrickEventInfo[], previousTrick: Trick): Observable<Card>;


    /**
     * DEBUG ONLY
     */
    // cards: Card[]
}

export class LocalHumanDeclarationWhist implements DeclarationWhistPlayer {

    //emitted when dealt a hand, and every time your hand changes
    public cards$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);

    //public only for hacky debug
    public cards: Card[];

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

    trumpsChosen(trumps: TrumpsEventInfo){
        //human player can see this themselves
    }

    public startRound(allPlayers: DeclarationWhistPlayer[]){
        //all up to the actual human to track things
    }

    public getBid(): Observable<number>{
        return this.bidOutput$.asObservable();
    }

    //game is requesting our bid
    declareBid(otherEstimates: BidEventInfo[]): Observable<number> {

        let validBids = [];
        let totalTrickEstimates = 0;
        if (otherEstimates.length == 3) {
            totalTrickEstimates = otherEstimates.map(estimate => estimate[1]).reduce((sum, current) => sum + current);
        }

        //must ensure we choose a valid count

        for (let i = 0; i <= 13; i++) {
            if ((otherEstimates.length != 3) || i + totalTrickEstimates != 13) {
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
    chooseTrumps(otherBids: BidEventInfo[]): Observable<Suit> {
        this.chooseTrumps$.next();

        return this.trumps$;
    }


    private removeCard(card: Card) {
        let index: number = this.cards.findIndex(thisCard => thisCard.equals(card));
        this.cards.splice(index, 1);
        this.cards$.next(this.cards);
    }

    playCard(trick: CardsInTrickEventInfo[], previousTrick: Trick): Observable<Card> {
        let validCards = this.cards.slice();
        if (trick.length > 0) {
            //suit to follow
            let followSuit = trick[0].cards[0].suit;
            let suitCount = Deck.getCardsInSuits(this.cards);

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
export class MoronDeclarationWhist implements DeclarationWhistPlayer {

    //public only for hacky debug
    public cards: Card[];
    private cards$: ReplaySubject<Card[]> = new ReplaySubject<Card[]>(1);

    constructor(public name: string) { }

    public dealHand(cards: Card[]) {
        this.cards = cards;
        this.cards$.next(cards);
    }

    public trumpsChosen(trumps: TrumpsEventInfo) {
        //moron is too dumb to care
    }

    public startRound(allPlayers: DeclarationWhistPlayer[]){
        //too stupid to care about tracking other players
    }

    /**
     * in ideal circumstances, how many tricks do we think we can win?
     */
    private preferedTrickEstimate(): number {

        let suitCount = Deck.getSuitCount(this.cards);

        //random guess!
        return Math.round(Math.random() * 13);

    }

    /**
     * Get our estimated number of tricks
     * @param otherEstimates estimates of the preceeding players, in order. array of tuples of player index and esimate [(0, 13), (1,10)]
     */
    public declareBid(otherEstimates: BidEventInfo[]): Observable<number> {

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
    public chooseTrumps(otherBids: BidEventInfo[]): Observable<Suit> {

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
    public playCard(trick: CardsInTrickEventInfo[], previousTrick: Trick): Observable<Card> {

        let cardIndex = 0;

        if (trick.length == 0) {
            //we play first
            cardIndex = Math.floor(Math.random() * this.cards.length);
        } else {
            //have to follow suit if we can
            let suit = trick[0].cards[0].suit;
            let sortedCards = Deck.getCardsInSuits(this.cards);
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
