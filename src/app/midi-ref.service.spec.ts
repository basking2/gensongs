import { TestBed, inject } from '@angular/core/testing';

import { MidiRefService } from './midi-ref.service';

describe('MidiRefService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MidiRefService]
    });
  });

  it('should be created', inject([MidiRefService], (service: MidiRefService) => {
    expect(service).toBeTruthy();
  }));
});
