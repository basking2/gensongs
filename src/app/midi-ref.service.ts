import { Injectable } from '@angular/core';

function _window(): any {
  return window;
}

@Injectable()
export class MidiRefService {

  constructor() { }

  get window() : any {
    return _window()
  }

  play() : any {
    var delay = 0; // play one note every quarter second
    var note = 50; // the MIDI note
    var velocity = 127; // how hard the note hits

    let midi: any = _window().MIDI;

    midi.setVolume(0, 127);
    midi.noteOn(0, note, velocity, delay);
    midi.noteOff(0, note, delay + 0.75);
  }
}
