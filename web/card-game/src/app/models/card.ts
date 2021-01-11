
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

    private valueLookup: string[] = ["",//little hack, value 0 just shows a blank card with the suit
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
        "A",
        "0"]//joker

    constructor(public suit: Suit, public value: number, public faceUp: boolean = true) {

    }

    public toString(): string {
        //face down, or being used to represent "no trumps chosen"
        if (!this.faceUp || this.suit == null) {
            return "back";
        }
        return this.valueLookup[this.value] + this.suit.substring(0, 1);
    }

   

    public equals(other: Card): boolean {
        return other.value == this.value && other.suit == this.suit && other.faceUp == this.faceUp;
    }

    private suitValue(): number {
        switch (this.suit) {
            case "Clubs":
                return 0;
            case "Diamonds":
                return 1;
            case "Hearts":
                return 2;
            case "Spades":
                return 3;
        }
    }

    /**
     * A numerical value for this card to compare with other cards
     * @param groupSuits If true, 2 of spades is worth more than Ace of hearts
     * if false, Ace of clubs is worth 1 more than King of spades (president comparison)
     */
    public cardValue(groupSuits: boolean = false, acesHigh = true): number {
        if (groupSuits) {
            return this.value + 13 * this.suitValue();
        } else {
            return this.value * 4 + this.suitValue();
        }
    }

}
