import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MoronDeclarationWhist, LocalHumanDeclarationWhist, DeclarationWhistPlayer } from 'src/app/models/declaration-whist-player';
import { LocalDeclarationWhist, DeclarationWhistEvent } from 'src/app/models/declaration-whist';
import { DeckService } from 'src/app/services/deck.service';
import { Subscription, Observable } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { CleverBotDeclarationWhist } from 'src/app/models/clever-bot';

@Component({
  selector: 'app-play-bots',
  templateUrl: './play-bots.component.html',
  styleUrls: ['./play-bots.component.css']
})
export class PlayBotsComponent implements OnInit, OnDestroy, AfterViewInit {



  public players: DeclarationWhistPlayer[];
  public player: LocalHumanDeclarationWhist;
  public roundRunning$: Observable<boolean>;

  public log: DeclarationWhistEvent[] = [];

  private subscriptions: Subscription[] = [];

  @ViewChild("logDiv", { static: true }) logDiv: ElementRef;

  constructor(private game: GameService) {

    this.players = [
      new MoronDeclarationWhist("Ted"),
      new MoronDeclarationWhist("Bill"),
      new MoronDeclarationWhist("Steve"),
      new CleverBotDeclarationWhist("Clever Bob")
    ];

    this.game.createDeclarationWhist(this.players, 200, -1, true);

    this.subscriptions.push(this.game.getGameEvents().subscribe(event => {
      this.log.push(event as DeclarationWhistEvent);
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
