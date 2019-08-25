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
    LocalPlayerHandComponent
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
