import { Card, suitArray, Suit } from './card';
import shuffle from '../misc';
import { CardPlayer } from './declaration-whist-player';
import { IfStmt } from '@angular/compiler';
export class Deck {

    public cards: Card[];
    /**
     * 
     * @param shuffled 
     * @param jokers 
     * @param equalForPlayers if provided, number of players to give equal hands (remove smallest cards first)
     */
    constructor(shuffled = true, jokers = false, equalForPlayers = -1) {
        let deck: Card[] = [];

        let removeCards = 0;
        if (equalForPlayers > 0) {
            removeCards = (52 + (jokers ? 2 : 0)) % equalForPlayers;
        }

        for (let value = 2; value <= 14; value++) {
            for (let suit = 0; suit < 4; suit++) {//[Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade]
                //magic https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript
                if (removeCards == 0) {
                    deck.push(new Card(suitArray[suit], value));
                } else {
                    //skip the first few
                    removeCards--;
                }
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


    /**
     * Return a shallow copy sorted list
     * @param cards 
     * @param groupSuits 
     */
    public static sort(cards: Card[], groupSuits: boolean = true): Card[] {
        return [...cards].sort((cardA, cardB) => cardA.cardValue(groupSuits) - cardB.cardValue(groupSuits))
    }

    /**
     * return all valid pairs (or triplets or quads) from a list of cards
     * @param cards 
     */
    public static getDuplicates(cards: Card[], count: number = 2): Card[][] {
        if (cards.length < count) {
            return [];
        }

        let pairs = [];

        let sorted = Deck.sort(cards);
        do {
            let allSame = true;
            for (let i = 0; i < count; i++) {
                if (sorted[i].value != sorted[0].value) {
                    allSame = false;
                    break;
                }
            }
            if (allSame) {
                let set = [];
                for (let i = 0; i < count; i++) {
                    set.push(sorted[i]);
                }
                pairs.push(set);
                sorted.splice(0, count);
            } else {
                sorted.splice(0, 1);
            }
        } while (sorted.length > 1)

        return pairs;
    }

    // public static cardsToString(cards: Card[]): string {
    //     let cardString = "";
    //     for (let card of cards) {
    //         cardString += cards.toString() + ",";
    //     }
    //     return cardString;
    // }


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

    /**
     * Return a numerical value for comparing poker hands or -1 if not a valid poker hand
     * @param cards 
     * 
     * Notes:
     * - Highest card in a category is enough to compare within category
     * - Card face values are 2 to 14 (ace)
     * - Grouping by suits, so 2 of clubs = 8, 2 of diamonds = 9
     * 
     * Straight:        AS*0 + (2C ... AS)
     * Flush:           AS*1 + (2C ... AS)
     * Full House:      AS*2 + (2C ... AS)
     * Straight Flush:  AS*3 + (2C ... AS)
     * Royal flush is just a high value straight flush
     * 
     */
    public static getPokerHandValue(cards: Card[]): number {
        if (cards.length != 5) {
            return -1;
        }
        let sortedCards = Deck.sort([...cards], false);
        let aceOfSpades = new Card("Spades", 14).cardValue();
        let highestValue = sortedCards[sortedCards.length - 1].cardValue();

        let suit = sortedCards[0].suit;
        let lowest = sortedCards[0].value - 1;
        let isFlush = true;
        let isStraight = true;
        //todo test for full house  
        let isFullHouse = false;
        let fullHouseValue: number = -1;

        if (sortedCards[0].value == sortedCards[1].value && sortedCards[3].value == sortedCards[4].value) {
            if (sortedCards[2].value == sortedCards[0].value) {
                isFullHouse = true;
                /// valuea, valuea, valuea, valueb, valueb
                fullHouseValue = sortedCards[2].cardValue();
            } else if (sortedCards[2].value == sortedCards[4].value) {
                isFullHouse = true;
                /// valuea, valuea, valueb, valueb, valueb
                fullHouseValue = sortedCards[4].cardValue();
            }
        }

        for (let card of sortedCards) {
            if (isStraight && card.value != lowest + 1) {
                isStraight = false;
            } else {
                lowest = card.value;
            }
            if (isFlush && card.suit != suit) {
                isFlush = false;
            }
        }
        console.log(`straight: ${isStraight}, flush: ${isFlush}, full house: ${isFullHouse}`);
        if (isStraight && isFlush) {
            //straight flush!
            return aceOfSpades * 3 + sortedCards[4].cardValue();
        } else
            if (isFullHouse) {
                return aceOfSpades * 2 + fullHouseValue;
            } else
                if (isFlush) {
                    return aceOfSpades + sortedCards[4].cardValue();
                } else
                    if (isStraight) {
                        return sortedCards[4].cardValue();
                    } else {
                        return -1;
                    }



    }

}

