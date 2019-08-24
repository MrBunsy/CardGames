import { Card, suitArray } from './card';
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

}

