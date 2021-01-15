import { forkJoin, Observable, ReplaySubject } from "rxjs";
import { filter, first } from "rxjs/operators";
import { Card } from "./card";
import { Deck } from "./deck";
import { CardsInTrickEventInfo, EventInfo, Game, GameEvent, IGame, Trick } from "./game";
import { PresidentPlayer } from "./PresidentPlayer";


// export class PresidentGameEventType{

// }

export class PresidentGameEvent extends GameEvent {
    constructor(public type: string,
        public eventInfo: any = null) {
        super(type, eventInfo, Game.President);
    }
}

export class PresidentRoundEndEventInfo {
    /**
     * Array of position of current players
     * so [currentPosition] = nextPosition
     * @param nextPositions 
     */
    constructor(public nextPositions: number[]) {

    }
}

// export class PresidentTrickStart extends EventInfo{

// }

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
    private tricks: Trick[];
    private rounds: number = 0;
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

        //hacky, don't keep
        // this.gameEvents.asObservable().pipe(
        //     filter(event => event.type=="RoundEnd")
        // ).subscribe(event => this.nextRound())

        // setInterval(() => { this.nextRound() }, 100)
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
        this.gameEvents.next(new PresidentGameEvent("RoundStart"),);

        this.startTrick(this.players[0]);

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
        let newTrick = new Trick(player);
        this.tricks.push(newTrick);
        this.playersFinished = 0;
        for (let player of this.players) {

        }
        let event = new EventInfo();
        event.player = player;
        event.playerIndex = this.currentPlayOrder.indexOf(player);
        this.gameEvents.next(new PresidentGameEvent("StartTrick", event));
        player.playOrPass(newTrick).pipe(first()).subscribe(cards => this.playCards(player, cards))
    }

    /**
     * This player is playing these cards on the current trick
     * @param player 
     * @param cards length of zero for pass
     */
    private playCards(player: PresidentPlayer, cards: Card[] = []) {
        //TODO verify valid play
        let playerIndex = this.currentPlayOrder.indexOf(player);
        let currentTrick = this.tricks[this.tricks.length - 1];
        let cardsInTick = new CardsInTrickEventInfo(cards, player, playerIndex);
        currentTrick.cards.push(cardsInTick);

        this.gameEvents.next(new PresidentGameEvent("CardsPlayed", cardsInTick));
        let cardString = "";
        for (let card of cards) {
            cardString += card.toString();
        }
        console.log(`Player ${player.name} plays ${cardString}`);

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
            let nextPlayer: PresidentPlayer = null;
            for (let j = 1; j < this.currentPlayOrder.length; j++) {
                let testPlayer = this.currentPlayOrder[(playerIndex + j) % this.currentPlayOrder.length];
                if (testPlayer.cards.length > 0 && !testPlayer.hasSkipped) {
                    //this player is the next player still in the round and trick
                    if (this.verbose) {
                        console.log(testPlayer.name + "'s turn");
                    }
                    nextPlayer = testPlayer;
                    break;
                }
            }
            if (nextPlayer != null) {
                nextPlayer.playOrPass(currentTrick).pipe(first()).subscribe(cards => this.playCards(nextPlayer, cards));
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
            for (let player of this.players) {
                if (player.nextPosition < 0) {
                    //this player still hard cards left, so wasn't assigned a position for next round yet - they'll be scum
                    player.nextPosition = this.players.length - 1;
                }
            }
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
                            if (this.verbose) {
                                console.log(`${testPlayer.name} starts next trick`)
                            }
                            currentTrick.winner = testPlayer;
                            for (let player of this.players) {
                                player.finishTrick(currentTrick);
                            }

                            this.startTrick(testPlayer);
                            return;
                        }


                    }
                }
            }
        }

    }

    private endRound() {
        this.rounds++;
        //work out who's in what seat for the next round!
        console.log("round ended")
        let newPlayOrder = []
        for (let player of this.currentPlayOrder) {
            console.log(`${player.name} finished in position ${player.nextPosition}`);
            newPlayOrder.push(player.nextPosition);
        }
        // this.nextRound();
        this.gameEvents.next(new PresidentGameEvent("RoundEnd", new PresidentRoundEndEventInfo(newPlayOrder)));
    }

    public nextRound() {
        this.tricks = [];

        for (let player of this.players) {
            player.currentPosition = player.nextPosition;
            this.currentPlayOrder[player.currentPosition] = player;
            player.nextPosition = -1;
            player.startRound(this.players);
        }
        this.playersFinished = 0;

        let deck = new Deck(true, false, this.currentPlayOrder.length);
        deck.deal(this.players);
        this.gameEvents.next(new PresidentGameEvent("SwapCards"));

        let pres = this.currentPlayOrder[0];
        let vp = this.currentPlayOrder[1];
        let vs = this.currentPlayOrder[this.currentPlayOrder.length - 2];
        let scum = this.currentPlayOrder[this.currentPlayOrder.length - 1];

        forkJoin([
            //pres
            this.currentPlayOrder[0].giveAwayCards(2, true),
            //VP
            this.currentPlayOrder[1].giveAwayCards(1, true),
            //VS
            this.currentPlayOrder[this.currentPlayOrder.length - 2].giveAwayCards(1, false),
            //scum
            this.currentPlayOrder[this.currentPlayOrder.length - 1].giveAwayCards(2, false),
        ]).pipe(first()).subscribe(
            ([presCards, vpCards, vsCards, scumCards]) => {
                if (this.verbose) {
                    console.log(`President ${pres.name} gives away ${presCards.toString()}`);
                    console.log(`VP ${vp.name} gives away ${vpCards.toString()}`);
                    console.log(`VS ${vs.name} gives away ${vsCards.toString()}`);
                    console.log(`Scum ${scum.name} gives away ${scumCards.toString()}`);
                }
                pres.giveCards(scumCards);
                vp.giveCards(vsCards);
                vs.giveCards(vpCards);
                scum.giveCards(presCards);
                this.gameEvents.next(new PresidentGameEvent("CardsSwapped"));
                this.startTrick(pres);
            }
        )
    }

}