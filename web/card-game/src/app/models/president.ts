import { Observable, ReplaySubject } from "rxjs";
import { first } from "rxjs/operators";
import { Card } from "./card";
import { Deck } from "./deck";
import { Game, GameEvent, IGame } from "./game";
import { PresidentPlayer } from "./PresidentPlayer";


// export class PresidentGameEventType{

// }

export class PresidentGameEvent extends GameEvent {
    constructor(public type: string,
        public event: any = null) {
        super(type, event, Game.President);
    }
}

export class PresidentEventInfo {
    public player: PresidentPlayer;
    //current position in this round
    public playerIndex: number;
}

export class CardsInTrickEvent extends PresidentEventInfo {
    constructor(public cards: Card[], public player: PresidentPlayer, public playerIndex) {
        super();
    }

}

export class PresidentTrick {
    constructor(public openedBy: PresidentPlayer) { }
    public cards: CardsInTrickEvent[] = [];
    public winner: PresidentPlayer = null;
}

/**
 * Plan: A Match lasts for an undetermined number of rounds.
 * Cards are dealt out at the beginning of each round.
 * Tricks are played until everyone bar one has run out of cards.
 * 
 * A round has an optional RoundPrepare where pres/vp and scum/vs swap cards
 * Then RoundStart
 */
export class LocalPresidentGame implements IGame {

    private gameEvents: ReplaySubject<PresidentGameEvent> = new ReplaySubject<PresidentGameEvent>(10);
    private currentPlayOrder: PresidentPlayer[] = [];
    private tricks: PresidentTrick[];
    private playersFinished: number;

    constructor(public players: PresidentPlayer[], private verbose = true) {

        //*cough* unit testing *cough*
        // let straight = [new Card("Clubs", 2),
        // new Card("Clubs", 3),
        // new Card("Clubs", 4),
        // new Card("Clubs", 5),
        // new Card("Spades", 6)
        // ];
        // let flush = [new Card("Clubs", 7),
        // new Card("Clubs", 8),
        // new Card("Clubs", 9),
        // new Card("Clubs", 10),
        // new Card("Clubs", 12)
        // ];
        // let fullHouse = [
        //     new Card("Diamonds", 14),
        //     new Card("Hearts", 14),
        //     new Card("Spades", 14),
        //     new Card("Spades", 2),
        //     new Card("Clubs", 2),
        // ]

        // console.log(Deck.getPokerHandValue(fullHouse));

        // console.log(PresidentPlayer.isMyHandBetter(fullHouse, flush));
        // console.log(PresidentPlayer.isMyHandBetter(straight, flush));
    }

    getGameEvents(): Observable<GameEvent> {
        return this.gameEvents.asObservable();
    }
    start() {
        this.tricks = [];

        if (this.players.length < 5) {
            console.error("Insufficient players");
            return;
        }

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].currentPosition = 0;
            this.players[i].nextPosition = -1;
            this.players[i].startRound(this.players);
        }

        this.currentPlayOrder = [...this.players];
        this.playersFinished = 0;

        let deck = new Deck(true, false, this.currentPlayOrder.length);
        deck.deal(this.players);
        this.gameEvents.next(new PresidentGameEvent("RoundStart"));

    }
    public type = Game.President;


    /**
     * A player can play what they like to lead a trick
     * @param player 
     */
    private startTrick(player: PresidentPlayer) {
        if (this.verbose) {
            console.log("Trick started by " + player.name);
        }
        let newTrick = new PresidentTrick(player);
        this.tricks.push(newTrick);

        player.playOrPass(newTrick).pipe(first()).subscribe(cards => this.playCards(player, cards))
    }

    /**
     * This player is playing these cards on the current trick
     * @param player 
     * @param cards length of zero for pass
     */
    private playCards(player: PresidentPlayer, cards: Card[] = []) {
        //TODO verify valid play
        let currentTrick = this.tricks[this.tricks.length - 1];
        let cardsInTick = new CardsInTrickEvent(cards, player, this.currentPlayOrder.indexOf(player));
        currentTrick.cards.push();
        let playerIndex = this.currentPlayOrder.indexOf(player);

        this.gameEvents.next(new PresidentGameEvent("CardsPlayed", cardsInTick));

        if (cards.length == 0) {
            player.hasSkipped = true;
        }

        let stillInTrick = 0;
        for (let player of this.players) {
            if (!player.hasSkipped && player.cards.length > 0) {
                //this player is still in the round
                stillInTrick++;
            }
        }
        if (stillInTrick <= 1) {
            //trick over!
            this.endTrick();
        } else {
            for (let j = 1; j < this.currentPlayOrder.length; j++) {
                let testPlayer = this.currentPlayOrder[(playerIndex + j) % this.currentPlayOrder.length];
                if (testPlayer.cards.length > 0 && !testPlayer.hasSkipped) {
                    //this player is the next player still in the round and trick
                    if (this.verbose) {
                        console.log(testPlayer.name + "'s turn");
                    }
                    testPlayer.playOrPass(currentTrick).pipe(first()).subscribe(cards => this.playCards(player, cards));
                    break;
                }
            }
        }


    }

    private endTrick() {
        let currentTrick = this.tricks[this.tricks.length - 1];


        let stillInRound = 0;
        for (let player of this.players) {
            if (player.cards.length > 0) {
                stillInRound++;
            } else if (player.nextPosition < 0) {
                //this player has just finished, assign them their position for next round
                player.nextPosition = this.playersFinished;
                this.playersFinished++;
            }
        }

        if (stillInRound <= 1) {
            //round over!
            this.endRound();
        } else {
            //find next player to play
            for (let i = currentTrick.cards.length - 1; i >= 0; i--) {
                if (currentTrick.cards[i].cards.length > 0) {
                    //these were the last set of cards played
                    let lastPlayerIndex = currentTrick.cards[i].playerIndex;

                    //next player along who still has cards, starting with player who last played
                    for (let j = 0; j < this.currentPlayOrder.length; j++) {
                        let testPlayer = this.currentPlayOrder[(lastPlayerIndex + j) % this.currentPlayOrder.length];
                        if (testPlayer.cards.length > 0) {
                            //this player still has cards, they've got control

                            this.startTrick(testPlayer);
                        }


                    }
                }
            }
        }

    }

    private endRound() {
        //work out who's in what seat for the next round!
        console.log("round ended")
        for (let player of this.currentPlayOrder) {
            console.log(`${player.name} finished in position ${player.nextPosition}`);
        }
    }

}