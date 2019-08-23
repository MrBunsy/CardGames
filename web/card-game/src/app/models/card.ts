
export enum Suit {
    Club = "C",
    Diamond = "D",
    Heart = "H",
    Spade = "S"
}

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

    constructor(public suit: Suit, public value: number) {

    }

    public toString(): string {
        return this.valueLookup[this.value] + this.suit.toString();
    }
}
