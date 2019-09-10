
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
        "A"]

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

}
