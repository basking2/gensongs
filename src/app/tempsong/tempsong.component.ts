import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeScript } from '@angular/platform-browser';
import { MidiRefService } from '../midi-ref.service';

@Component({
  selector: 'app-tempsong',
  templateUrl: './tempsong.component.html',
  styleUrls: ['./tempsong.component.css'],
  providers: [
    MidiRefService
  ]
})
export class TempsongComponent implements OnInit {

  script: SafeScript
  clickMessage: String
  midiRefService: MidiRefService
  midi: any

  constructor(domSanitizer: DomSanitizer, midiRefService: MidiRefService) {
    this.script = domSanitizer.bypassSecurityTrustHtml(
      '<script src="assets/tempsong.js" type="text/javascript"></script>'
    )
    this.midiRefService = midiRefService
    this.midi = midiRefService.window.MIDI
  }

  ngOnInit() {
    // var delay = 0; // play one note every quarter second
    // var note = 50; // the MIDI note
    // var velocity = 127; // how hard the note hits
    //
    // console.log(this.midiRefService.window.MIDI)
    // let midi: any = this.midiRefService.window.MIDI;
    // midi.setVolume(0, 127);
    // midi.noteOn(0, note, velocity, delay);
    // midi.noteOff(0, note, delay + 0.75);
  }

  onClickMe() {
    this.clickMessage = 'You are my hero!';
    this.midiRefService.play()
  }


}
