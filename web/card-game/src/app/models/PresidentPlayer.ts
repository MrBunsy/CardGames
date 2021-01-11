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

    static getTypeOfPokerHand(cards: Card[]): "Straight" | "Flush" | "FullHouse" | "StraightFlush" {

    }

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
    playOrPass(trickSoFar: PresidentTrick): Observable<Card[]> {
        switch (trickSoFar.cards.length) {
            case 1:

                break;
        }
    }
    startRound(allPlayers: PresidentPlayer[]) {
        super.startRound(allPlayers);
    }
    dealHand(cards: Card[]) {
        super.dealHand(cards);
    }

}