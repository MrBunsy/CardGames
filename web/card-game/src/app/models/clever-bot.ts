import { DeclarationWhistPlayer } from './player';
import { Card, Suit, suitArray } from './card';
import { ReplaySubject, Observable, of } from 'rxjs';
import { TrumpsEvent, BidEvent, CardInTrickEvent, Trick } from './declaration-whist';
import { Deck } from './deck';

//three different versions of this now... oops
class PlayerInfo {
    public playedCards: Card[];
    public bid: number;
    public choseTrumps: boolean;
    public tricksWon: number;
    public suitsLeft: Suit[];

    constructor(public player: DeclarationWhistPlayer) {
        this.playedCards = [];
        this.tricksWon = 0;
        this.suitsLeft = suitArray.slice();
    }

    public tryingToWin(): boolean {
        return this.bid != this.tricksWon;
    }

    public stillHasSuit(suit: Suit) {
        return this.suitsLeft.indexOf(suit) >= 0;
    }

}

export class CleverBot implements DeclarationWhistPlayer {
    //public only for debug
    public cards: Card[];
    private startingCards: Card[];
    //what are trumps, and who chose them?
    private trumps: TrumpsEvent;
    //track what other players have played
    // private otherPlayersPlayed: Map<DeclarationWhistPlayer, Card[]>;
    private allPlayers: PlayerInfo[];
    private seenCards: Card[];

    // private tricks: 

    private tricksWon: number;
    private bid: number;

    /**
     * 
     * @param name 
     * @param winToValue ratio of probablity of win / probable value of card, which a card must exceed to be worth using to try to win a trick
     */
    constructor(public name: string, private winToValue: number = 0.8) { }

    public startRound(allPlayers: DeclarationWhistPlayer[]) {
        //reset everything we're tracking
        // this.otherPlayersPlayed = new Map<DeclarationWhistPlayer, Card[]>();
        // for (let player of allPlayers) {
        //     this.otherPlayersPlayed.set(player, []);
        // }
        this.allPlayers = [];
        this.tricksWon = 0;
        this.seenCards = [];
        this.bid = 0;
        for (let player of allPlayers) {
            this.allPlayers.push(new PlayerInfo(player));
        }
    }

    public dealHand(cards: Card[]) {
        this.cards = Deck.sort(cards, true);
        //make a copy
        this.startingCards = cards.slice();

    }

    public trumpsChosen(trumps: TrumpsEvent) {
        this.trumps = trumps;
        this.allPlayers[trumps.playerIndex].choseTrumps = true;
    }

    /**
     * in ideal circumstances, how many tricks do we think we can win?
     */
    private preferedBid(otherBids: BidEvent[]): number {
        /**
         * Inputs: other bids, our cards
         * Considerations: trumps, starting first
         */

        let sorted: Map<Suit, Card[]> = Deck.getCardsInSuits(this.cards);
        let topCards: Map<Suit, Card[]> = new Map<Suit, Card[]>();
        let topCardCount = 0;
        let topCardAverage = 0;
        for (let suit of suitArray) {
            topCards[suit] = [];
            for (let card of sorted[suit]) {
                let chance = this.chanceOfBeingHighestInSuit(card)
                if (chance == 1) {
                    topCardCount++;
                    topCards[suit].push(card);
                }
                topCardAverage += chance;
            }
        }

        //bit of fiddling, seems not unreasonable
        return Math.round(topCardAverage / 1.5);

    }

    /**
     * Get our estimated number of tricks
     */
    public declareBid(otherBids: BidEvent[]): Observable<number> {

        let wantBid = this.preferedBid(otherBids);

        if (otherBids.length == 3) {
            //must ensure we choose a valid count
            let totalTrickEstimates = otherBids.map(estimate => estimate[1]).reduce((sum, current) => sum + current);

            if (wantBid + totalTrickEstimates == 13) {
                //can't have this estimate, let's ... uh subtract one for now
                //TODO decide waht's best based on the other players' bids
                wantBid--;
            }

        }

        this.bid = wantBid;

        return of(wantBid);

    }

    /**
     * This player's estimate was highest, they get to choose trumps
     */
    public chooseTrumps(otherBids: BidEvent[]): Observable<Suit> {
        for (let bid of otherBids) {
            this.allPlayers[bid.playerIndex].bid = bid.bid;
        }
        let trumps: Suit = "Clubs";
        let highestCount = 0;

        //choose suit with most cards
        let count = Deck.getSuitCount(this.cards);
        for (let suit of suitArray) {
            if (count[suit] > highestCount) {
                highestCount = count[suit];
                trumps = suit;
            }
        }

        return of(trumps);

    }
    private ourBestTrump(): Card {
        let ourTrumps = this.cards.filter(card => card.suit == this.trumps.suit);
        if (ourTrumps.length == 0) {
            return null;
        }
        //relying on our cards being sorted
        return ourTrumps[ourTrumps.length - 1];
    }
    private getPlayerInfoFromPlayer(player: DeclarationWhistPlayer): PlayerInfo {
        return this.allPlayers.find(test => test.player == player);
    }

    /**
     * Get teh suit we should be following for a trick. Doesn't take into accoutn anyone trumping it
     * @param trick 
     */
    private getLeadingSuitFromTrick(trick: CardInTrickEvent[]): Suit {
        if (trick.length > 0) {
            return trick[0].card.suit;
        }

        return null;
    }

    /**
     * Returns true if trick was lead in trumps, or has been trumped
     * @param trick 
     */
    private hasTrickBeenTrumped(trick: CardInTrickEvent[]): boolean {

        for (let cardInTrick of trick) {
            if (cardInTrick.card.suit == this.trumps.suit) {
                return true;
            }
        }

        return false;
    }

    /**
     * Best guess at winning by playing a specific card
     * @param card 
     */
    private probablityToWinTrick(trick: CardInTrickEvent[], card: Card): number {
        if (!this.possibleToWinTrick(trick.map(trick => trick.card), card)) {
            return 0;
        }
        let chanceOfHighest = this.chanceOfBeingHighestInSuit(card);

        let cardsInTrick = trick.length;
        let followingSuit = this.getLeadingSuitFromTrick(trick);
        let trumped = this.hasTrickBeenTrumped(trick);

        //increase chances based on how many other players have played so far
        for (let i = 0; i < 4; i++) {
            let increaseChanceBy = 0;
            let thisPlayer: PlayerInfo;
            if (trick.length > 0) {
                thisPlayer = this.allPlayers[(trick[0].playerIndex + i) % this.allPlayers.length];
            } else {
                //we are the first player
                thisPlayer = this.allPlayers[(this.allPlayers.findIndex(test => test.player == this) + i) % this.allPlayers.length];
            }
            if (thisPlayer.player == this) {
                continue;
            }

            if (i < cardsInTrick) {
                //this is a card already played, given that it's possible to win the trick, increase the chances because we don't
                //know where the cards that can beat it are

                if (thisPlayer.stillHasSuit(followingSuit) || thisPlayer.stillHasSuit(this.trumps.suit)) {
                    //a preceeding player hasn't run out of a suit yet, maybe, so count them as having had a small chance of holding the card whcih could beat this one


                    if (thisPlayer.tryingToWin()) {
                        //if they want to win, likely to be hoarding good cards
                        increaseChanceBy = 0.5;
                    } else {
                        //anyone who can't play a card now is still helpful to us
                        increaseChanceBy = 0.25
                    }


                }
            } else {
                //the players yet to play
                if (thisPlayer.tryingToWin()) {
                    //if they want to win, likely to be trying to beat us
                    increaseChanceBy = -0.1;
                } else {
                    //likely not trying to beat us
                    increaseChanceBy = 0.5
                }
            }

            chanceOfHighest += (1 - chanceOfHighest) * increaseChanceBy;
        }

        //TODO take into account other players current win/bid - if they're yet to play and are tryin
        return chanceOfHighest;
    }

    /**
     * How much is this card worth, taking into account what we know of the game?
     * Intended to work out which card to get rid of when we can't or don't want to win
     * @param card 
     * 
     * scaled from 0-1
     */
    private probableValueOfCard(card: Card): number {
        //TODO take into account who's run out of a suit and trumps and card distribution
        //this only takes into account if it's the highest known of its suit
        return this.chanceOfBeingHighestInSuit(card);

        // return card.value + (card.suit == this.trumps.suit ? 13 : 0);
    }


    /*
    Is a card one of our starting cards, or one we've seen someone else play already this round?
    */
    private cardPlayedOrOurs(card: Card): boolean {
        return this.startingCards.findIndex(testCard => testCard.equals(card)) >= 0 || this.seenCards.findIndex(testCard => testCard.equals(card)) >= 0;
    }

    /**
     * 1 if the only higher cards are in our hand or have already been seen
     * less than one if we're guessing
     * @param card 
     */
    private chanceOfBeingHighestInSuit(card: Card): number {
        if (this.cardPlayedOrOurs(card)) {
            if (card.value == 14) {
                //if it's ours or known, then it's the highest... sort of
                return 1;
            }

            //check to see if the next highest card is the highest
            if (this.chanceOfBeingHighestInSuit(new Card(card.suit, card.value + 1)) == 1) {
                return 1;
            }
        }
        //TODO take into account card counting, who's run out of suits, who's trying to lose, etc

        //further from an ace, lower the chance
        return 1 / (15.5 - card.value);

    }

    /**
     * Is it /possible/ to win the trick based on what we've seen so far?
     * @param trick 
     */
    private possibleToWinTrick(trick: Card[], card: Card = null): boolean {

        if (trick.length == 0) {
            //TODO check card against card-counted bots
            return true;
        }

        let validCards = this.cards.slice();

        let trumped = false;
        for (let card of trick) {
            if (card.suit == this.trumps.suit) {
                trumped = true;
                break;
            }
        }

        let followingSuit = true;
        let trickSuit: Suit;

        if (trick.length > 0) {
            //have to follow suit if we can
            trickSuit = trick[0].suit;
            let sortedCards = Deck.getCardsInSuits(this.cards);
            if (sortedCards[trickSuit].length > 0) {
                validCards = sortedCards[trickSuit].slice();
            } else {
                followingSuit = false;
            }
        }//else we play first


        if (card == null) {
            //we're not testing a specific card, just generally if its possible to win, continue tests below assuming our best valid card
            card = validCards[validCards.length - 1];
        }

        if (followingSuit) {
            if (trumped && trickSuit != this.trumps.suit) {
                //we have to follow suit, but someone else has trumped it.
                return false;
            }
            if (trickSuit != card.suit) {
                //we have to follow suit, but the test card isn't the right suit
                return false;
            }
            //sorted list of cards that could win the trick
            let relevantTrickCards: Card[] = Deck.sort(trick.filter(card => card.suit == trickSuit || card.suit == this.trumps.suit));

            //our best card is better than the current best card
            return relevantTrickCards[relevantTrickCards.length - 1].value < card.value;

        } else {
            //not following suit
            if (card.suit != this.trumps.suit) {
                //not a trump, no chance
                return false;
            }

            let trumpsInTrick = Deck.sort(trick.filter(card => card.suit == this.trumps.suit));

            if (trumpsInTrick.length == 0) {
                return true;
            }
            return trumpsInTrick[trumpsInTrick.length - 1].value < card.value;

        }
    }

    /**
     * Get our card for a trick
     * @param trick array of tupes of who (player index) played what
     */
    public playCard(trick: CardInTrickEvent[], previousTrick: Trick): Observable<Card> {

        if (previousTrick != null) {
            //update all our tracking of whatnot
            for (let card of previousTrick.cards) {
                this.allPlayers[card.playerIndex].playedCards.push(card.card);
                this.seenCards.push(card.card);
            }
            let winnerIndex = this.allPlayers.findIndex(player => player.player == previousTrick.winner);
            this.allPlayers[winnerIndex].tricksWon++;
            if (previousTrick.winner == this) {
                this.tricksWon++;
            }
        }

        let cardIndex = 0;
        let validCards = this.cards.slice();

        let trumped = false;
        for (let card of trick.map(trick => trick.card)) {
            if (card.suit == this.trumps.suit) {
                trumped = true;
                break;
            }
        }

        let wantToWin = this.tricksWon != this.bid;
        let followingSuit = true;
        let playingFirst = false;

        if (trick.length > 0) {
            //have to follow suit if we can
            let suit = trick[0].card.suit;
            let sortedCards = Deck.getCardsInSuits(this.cards);
            if (sortedCards[suit].length > 0) {
                validCards = sortedCards[suit].slice();
            } else {
                followingSuit = false;
            }
        } else {
            playingFirst = true;
        }

        let valuedCards = validCards.sort((a, b) => this.probableValueOfCard(a) - this.probableValueOfCard(b));

        let playCard: Card;
        // if (playingFirst) {

        //     if (this.tricksWon != this.bid) {
        //         //either we're below the bid and trying to reach it, or we've overshot and might as well get the points
        //         playCard = valuedCards[validCards.length - 1];
        //     } else {
        //         playCard = valuedCards[0];
        //     }


        // } else 
        // if (this.possibleToWinTrick(trick.map(trick => trick.card))) {
        //we have a chance to win this trick

        //sort cards in order of probability of winning
        let bestCards = validCards.sort((a, b) => this.probablityToWinTrick(trick, a) - this.probablityToWinTrick(trick, b));
        let mostLikelyToWin = bestCards[bestCards.length - 1];
        let leastLikelyToWin = bestCards[0];

        // //duplication of logic here, TODO refactor
        // //try to win or try to lose based on how many tricks we've won
        // if (this.tricksWon != this.bid) {
        //     //either we're below the bid and trying to reach it, or we've overshot and might as well get the points
        //     playCard = mostLikelyToWin;
        // } else {
        //     //TODO improve, actually want to play the highest VALUE card which won't win us hte trick
        //     playCard = leastLikelyToWin;
        // }

        //note - currently probability to win and value are the same, since they don't take into acoutn all information available.
        let winChance = this.probablityToWinTrick(trick, mostLikelyToWin)
        // let wintoValueRatio = winChance / this.probableValueOfCard(mostLikelyToWin);
        // console.log("Player "+this.name+" win to value ratio of " + mostLikelyToWin.toString() + ":" + wintoValueRatio);
        // if (wintoValueRatio > this.winToValue) {
        //     //the chance of this card winning is high enough to be worth using it
        //     playCard = mostLikelyToWin;
        console.log("Player " + this.name + " win chance of " + mostLikelyToWin.toString() + ":" + winChance);
        if (winChance > this.winToValue) {

            playCard = mostLikelyToWin;
        } else {
            //we don't want to waste our best card trying to win, because it's too low chance

            //TODO take into account cards worth protecting, and throw away anything that's not protecting anythign else first
            if (wantToWin) {
                //want to win overall, so lose our worst card
                playCard = valuedCards[0];

            } else {
                //want to lose, so ditch the best cards
                playCard = valuedCards[validCards.length - 1];
            }

        }

        cardIndex = this.cards.findIndex(card => card.equals(playCard));

        this.cards.splice(cardIndex, 1);
        return of(playCard);

    }
}
