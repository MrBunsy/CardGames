import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTrumpsComponent } from './choose-trumps.component';

describe('ChooseTrumpsComponent', () => {
  let component: ChooseTrumpsComponent;
  let fixture: ComponentFixture<ChooseTrumpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseTrumpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseTrumpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
