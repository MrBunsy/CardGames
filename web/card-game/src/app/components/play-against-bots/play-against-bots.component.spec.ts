import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayAgainstBotsComponent } from './play-against-bots.component';

describe('PlayAgainstBotsComponent', () => {
  let component: PlayAgainstBotsComponent;
  let fixture: ComponentFixture<PlayAgainstBotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayAgainstBotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayAgainstBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
