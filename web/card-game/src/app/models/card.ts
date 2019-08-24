
export enum Suit {
    Club = "C",
    Diamond = "D",
    Heart = "H",
    Spade = "S"
}

export const suitArray: Suit[] = [Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade];


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
        return this.valueLookup[this.value] + this.suit.toString();
    }

    /**
     * TODO find somewhere better to store useful stuff like this
     * @param cards 
     */
    public static getSuitCount(cards: Card[]): Map<Suit, number> {
        let count = new Map<Suit, number>();
        count[Suit.Club] = 0;
        count[Suit.Diamond] = 0;
        count[Suit.Heart] = 0;
        count[Suit.Spade] = 0;

        for (let card of cards) {
            count[card.suit]++;
        }

        return count;
    }

}
