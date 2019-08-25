import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemotePlayerHandComponent } from './remote-player-hand.component';

describe('RemotePlayerHandComponent', () => {
  let component: RemotePlayerHandComponent;
  let fixture: ComponentFixture<RemotePlayerHandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemotePlayerHandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemotePlayerHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
