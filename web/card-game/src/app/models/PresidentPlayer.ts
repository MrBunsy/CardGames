import { Observable, of } from "rxjs";
import { Card } from "./card";
import { Deck } from "./deck";
import { CardPlayer } from "./declaration-whist-player";
import { PresidentTrick } from "./president";


/**
 * Base class for all president players, but also holds player info
 * for tracking game state internally
 */
export class PresidentPlayer implements CardPlayer {

    // /**
    //  * Return what type of hand a set of cards is
    //  * @param cards 
    //  */
    // static getTypeOfHand(cards: Card[]): "Single" | "Double" | "Triple" | "Quadruple" | "Poker"{
    //     switch(cards.length){
    //         case 
    //     }
    // }

    // static getTypeOfPokerHand(cards: Card[]): "Straight" | "Flush" | "FullHouse" | "StraightFlush" {

    // }

    public cards: Card[];

    constructor(public name: string) {

    }

    public hasSkipped: boolean;
    public currentPosition: number;
    public nextPosition: number;

    public dealHand(cards: Card[]) {
        this.cards = cards;
    }

    /**
     * Provide list of all other players, in their play order
     * @param allPlayers 
     */
    public startRound(allPlayers: PresidentPlayer[]) {
        this.hasSkipped = false;
    }

    /**
     * this player's turn, either play cards or return with [] for pass
     * @param trickSoFar 
     */
    public playOrPass(trickSoFar: PresidentTrick): Observable<Card[]> {
        //must be implemented by concrete implementation
        throw new Error("Method not implemented.");
    }

    public static isMyHandBetter(myHand: Card[], theirHand: Card[]): boolean {
        if (myHand.length != theirHand.length) {
            //not a valid play anyway
            console.error("Trying to compare hands of different type");
            return false
        }
        switch (theirHand.length) {
            case 1:
            case 3:
            case 4:
                return myHand[0].cardValue() > theirHand[0].cardValue();
                break;
            case 2:
                //could be comparing two pairs of same face value, so compare highest with highest
                let ourHighest = myHand[0].cardValue() > myHand[1].cardValue() ? myHand[0] : myHand[1];
                let theirHighest = theirHand[0].cardValue() > theirHand[1].cardValue() ? theirHand[0] : theirHand[1];
                return ourHighest.cardValue() > theirHighest.cardValue();
                break;
            case 5:
                return Deck.getPokerHandValue(myHand) > Deck.getPokerHandValue(theirHand);
            default:
                return false;
        }
    }
}

/**
 * Plays valid cards but with simplistic strategy
 */
export class MoronPresidentPlayer extends PresidentPlayer {
    public playOrPass(trickSoFar: PresidentTrick): Observable<Card[]> {
        let topCards = trickSoFar.cards[trickSoFar.cards.length].cards;
        switch (topCards.length) {
            case 1:
                for (let card of this.cards) {
                    //play lowest card that's valid
                    if (card.cardValue() > topCards[0].cardValue()) {
                        this.cards = this.cards.splice(this.cards.indexOf(card), 1);
                        return of([card]);
                    }
                }
                break;
            case 2:
            case 3:
            case 4:
                //play lowest pair/triple/quad that's valid
                let sets: Card[][] = Deck.getDuplicates(this.cards, topCards.length);
                for (let set of sets) {
                    //play if highest in our set is higher than highest in their set
                    if (set[topCards.length - 1].cardValue() > Deck.sort(topCards)[topCards.length - 1].cardValue()) {
                        this.cards = this.cards.splice(this.cards.indexOf(set[0], set.length));
                        return of(set);
                    }
                }
                break;
            case 5:
                //TODO find poker hands
                break;
        }
        //have to pass
        return of([]);
    }
    startRound(allPlayers: PresidentPlayer[]) {
        super.startRound(allPlayers);
    }
    dealHand(cards: Card[]) {
        super.dealHand(cards);
        this.cards = Deck.sort(this.cards);
    }

}