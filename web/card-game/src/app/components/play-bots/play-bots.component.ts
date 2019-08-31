import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Moron, LocalHuman, DeclarationWhistPlayer } from 'src/app/models/player';
import { LocalDeclarationWhist, DeclarationWhistGameEvents } from 'src/app/models/declaration-whist';
import { DeckService } from 'src/app/services/deck.service';
import { Subscription, Observable } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { CleverBot } from 'src/app/models/clever-bot';

@Component({
  selector: 'app-play-bots',
  templateUrl: './play-bots.component.html',
  styleUrls: ['./play-bots.component.css']
})
export class PlayBotsComponent implements OnInit, OnDestroy, AfterViewInit {



  public players: DeclarationWhistPlayer[];
  public player: LocalHuman;
  public roundRunning$: Observable<boolean>;

  public log: DeclarationWhistGameEvents[] = [];

  private subscriptions: Subscription[] = [];

  @ViewChild("logDiv") logDiv: ElementRef;

  constructor(private game: GameService) {

    this.players = [
      new Moron("Ted"),
      new Moron("Bill"),
      new Moron("Steve"),
      new CleverBot("Clever Bob")
    ];

    this.game.createDeclarationWhist(this.players, 1000, -1, true);

    this.subscriptions.push(this.game.getGameEvents().subscribe(event => {
      this.log.push(event);
      this.scrollLog();
    }));

    // this.game.start();

    this.roundRunning$ = this.game.getRoundInProgress();

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

  }

  private scrollLog() {
    if (this.logDiv && this.logDiv.nativeElement) {
      this.logDiv.nativeElement.scrollTop = this.logDiv.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }

}
