import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayBotsComponent } from './play-bots.component';

describe('PlayBotsComponent', () => {
  let component: PlayBotsComponent;
  let fixture: ComponentFixture<PlayBotsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayBotsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayBotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
