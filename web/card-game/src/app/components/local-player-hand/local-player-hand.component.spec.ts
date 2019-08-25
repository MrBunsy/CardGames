import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalPlayerHandComponent } from './local-player-hand.component';

describe('LocalPlayerHandComponent', () => {
  let component: LocalPlayerHandComponent;
  let fixture: ComponentFixture<LocalPlayerHandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalPlayerHandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalPlayerHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
