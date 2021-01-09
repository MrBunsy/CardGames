import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayPresidentAgainstBotsComponent } from './play-president-against-bots.component';

describe('PlayPresidentAgainstBotsComponent', () => {
  let component: PlayPresidentAgainstBotsComponent;
  let fixture: ComponentFixture<PlayPresidentAgainstBotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayPresidentAgainstBotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayPresidentAgainstBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
