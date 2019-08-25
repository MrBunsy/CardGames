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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CardComponent,
    HandComponent,
    PlayBotsComponent,
    AboutComponent,
    PlayAgainstBotsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
