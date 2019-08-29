import { Card, suitArray, Suit } from './card';
import shuffle from '../misc';
import { CardPlayer } from './player';
export class Deck {

    public cards: Card[];

    constructor(shuffled = true, jokers = false) {
        let deck: Card[] = [];


        for (let suit = 0; suit < 4; suit++) {//[Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade]
            for (let value = 2; value <= 14; value++) {
                //magic https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
                deck.push(new Card(suitArray[suit], value))
            }
        }

        //TODO jokers

        if (shuffled) {
            deck = shuffle(deck);
        }

        this.cards = deck;
    }

    public deal(players: CardPlayer[]) {
        let deckSize = this.cards.length;

        if (deckSize % players.length != 0) {
            console.log("Can't deal equal numbers of cards")
        }

        let hands: Card[][] = [];
        for (let player of players) {
            hands.push([]);
        }

        let player = 0;
        for (let card of this.cards) {
            hands[player].push(card);
            player++;
            player %= players.length;
        }

        for (let i = 0; i < players.length; i++) {
            players[i].dealHand(hands[i]);
        }

    }

    private static suitValue(suit: Suit): number {
        switch (suit) {
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

    private static cardValue(card: Card, groupSuits: boolean): number {
        if (groupSuits) {
            return card.value + 13 * Deck.suitValue(card.suit);
        } else {
            return card.value * 4 + Deck.suitValue(card.suit);
        }
    }

    public static sort(cards: Card[], groupSuits: boolean = true): Card[] {
        return cards.sort((cardA, cardB) => Deck.cardValue(cardA, groupSuits) - Deck.cardValue(cardB, groupSuits))
    }
    
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

