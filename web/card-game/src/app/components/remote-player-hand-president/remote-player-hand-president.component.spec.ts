import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemotePlayerHandPresidentComponent } from './remote-player-hand-president.component';

describe('RemotePlayerHandPresidentComponent', () => {
  let component: RemotePlayerHandPresidentComponent;
  let fixture: ComponentFixture<RemotePlayerHandPresidentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemotePlayerHandPresidentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemotePlayerHandPresidentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
