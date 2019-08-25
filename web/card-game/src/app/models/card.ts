
// export enum Suit {
//     Club = "C",
//     Diamond = "D",
//     Heart = "H",
//     Spade = "S"
// }
//note, turns out enums in typescript are shit. Actual JS of this enum: {Club: "C", Diamond: "D", Heart: "H", Spade: "S"}

export type Suit = "Clubs" | "Diamonds" | "Hearts" | "Spades";

export const suitArray: Suit[] = new Array<Suit>("Clubs", "Diamonds", "Hearts", "Spades");


export class Card {

    private valueLookup: string[] = ["0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "T",
        "J",
        "Q",
        "K",
        "A"]

    constructor(public suit: Suit, public value: number, public faceUp: boolean = true) {

    }

    public toString(): string {
        if (!this.faceUp) {
            return "back";
        }
        return this.valueLookup[this.value] + this.suit.substring(0, 1);
    }

    /**
     * TODO find somewhere better to store useful stuff like this
     * @param cards 
     */
    public static getSuitCount(cards: Card[]): Map<Suit, number> {
        let count = new Map<Suit, number>();
        for (let suit of suitArray) {
            count[suit] = 0;
        }
        for (let card of cards) {
            count[card.suit]++;
        }

        return count;
    }

    public static getCardsInSuits(cards: Card[]): Map<Suit, Card[]> {
        let sortedCards = new Map<Suit, Card[]>();
        for (let suit of suitArray) {
            sortedCards[suit] = [];
        }

        for (let card of cards) {
            sortedCards[card.suit].push(card);
        }

        return sortedCards;
    }

}
