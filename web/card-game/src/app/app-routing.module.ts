import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PlayBotsComponent } from './components/play-bots/play-bots.component';
import { AboutComponent } from './components/about/about.component';
import { PlayAgainstBotsComponent } from './components/play-against-bots/play-against-bots.component';
import { PlayPresidentAgainstBotsComponent } from './components/play-president-against-bots/play-president-against-bots.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', component: PlayAgainstBotsComponent },
  { path: 'play-bots', component: PlayBotsComponent },
  { path: 'play-vs-bots', component: PlayAgainstBotsComponent },
  { path: 'president-vs-bots', component: PlayPresidentAgainstBotsComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
