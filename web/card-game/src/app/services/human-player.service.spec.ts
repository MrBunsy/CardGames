import { TestBed } from '@angular/core/testing';

import { HumanPlayerService } from './human-player.service';

describe('HumanPlayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HumanPlayerService = TestBed.get(HumanPlayerService);
    expect(service).toBeTruthy();
  });
});
