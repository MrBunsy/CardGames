import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { CardComponent } from './components/card/card.component';
import { HandComponent } from './components/hand/hand.component';
import { PlayBotsComponent } from './components/play-bots/play-bots.component';
import { AboutComponent } from './components/about/about.component';
import { PlayAgainstBotsComponent } from './components/play-against-bots/play-against-bots.component';
import { BidComponent } from './components/bid/bid.component';
import { FormsModule } from '@angular/forms';
import { LocalPlayerHandComponent } from './components/local-player-hand/local-player-hand.component';
import { ChooseTrumpsComponent } from './components/choose-trumps/choose-trumps.component';
import { RemotePlayerHandComponent } from './components/remote-player-hand/remote-player-hand.component';
import { TrumpTrackerComponent } from './components/trump-tracker/trump-tracker.component';
import { TricksWonTrackerComponent } from './components/tricks-won-tracker/tricks-won-tracker.component';
import { ActiveTrickComponent } from './components/active-trick/active-trick.component';
import { BidTrackerComponent } from './components/bid-tracker/bid-tracker.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CardComponent,
    HandComponent,
    PlayBotsComponent,
    AboutComponent,
    PlayAgainstBotsComponent,
    BidComponent,
    LocalPlayerHandComponent,
    ChooseTrumpsComponent,
    RemotePlayerHandComponent,
    TrumpTrackerComponent,
    TricksWonTrackerComponent,
    ActiveTrickComponent,
    BidTrackerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
