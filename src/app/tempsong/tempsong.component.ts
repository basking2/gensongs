import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeScript } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
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
  midi: any

  constructor(
    private domSanitizer: DomSanitizer,
    private midiRefService: MidiRefService,
    private http: HttpClient
  ) {
    this.script = domSanitizer.bypassSecurityTrustHtml(
      '<script src="assets/tempsong.js" type="text/javascript"></script>'
    )
    this.midi = midiRefService.window.MIDI
  }

  toXylod(byte: number) : number[] {
    // Get LOD

    return []
  }

  toXylods(byteNum: number, b: number): number[][] {
    var xylods = []
    var offset = byteNum * 8

    return [[0,0,0]]

    for (var i = 7; i >= 0; i--) {
      if (((b >> 7)&0x1) > 0) {
        xylods.push(this.toXylod(byteNum + (8-i)))
      }
    }

    return xylods;
  }

  ngOnInit() {
    this.http.get('assets/datasource.js').subscribe(
      config => {
        var [p, v] = config["p"].split(":", 2)
        this.http.get(config['url'] + '/info?products=' + config["p"]).subscribe(info => {
          var t = info['layers'][p][v]['dimensions'][0]['t'][0]
          console.log("T", t)
          this.http.get(config['url'] + '/coverage?products='+config['p']+'&t='+t, {"responseType": 'arraybuffer'}).subscribe(coverage => {
            var c = 0
            for (var i = coverage.byteLength-1; i >= 0; i--) {
              c = coverage[i]
              if (c != 0) {
                console.log("Coverage", i, coverage[i])
                break;
              }

            }
          })
        })
      }
    );
  }

  onClickMe() {
    this.clickMessage = 'You are my hero!';
    this.midiRefService.play()
  }


}
