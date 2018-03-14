import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeScript } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MidiRefService } from '../midi-ref.service';

var WIDTH = 256

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

  indexToLod(x: number) : number {
    x = 3 * x
    x + 1
    x = Math.log(x) / Math.log(4)
    var lod = Math.floor(x)

    return lod
  }

  lodToIndex(lod: number) : number {
    var i = lod
    i = Math.pow(4, i) - 1
    i = i / 3
    return Math.floor(i)
  }

  lodWidth(lod: number) : number {
    return Math.pow(2, lod)
  }

  indexToXylod(index: number) : [number, number, number] {
    var lod = this.indexToLod(index)
    var base = index - this.lodToIndex(lod) - 1
    var w = this.lodWidth(lod)
    var x = base % w
    var y = Math.floor(base / w)
    return [x, y, lod]
  }

  toXylods(byteNum: number, b: number): number[][] {
    var xylods = []
    var offset = byteNum * 8

    for (var i = 7; i >= 0; i--) {
      console.log(b >>i, i)
      if (!! ((b >> i) & 0x1)) {
        var xylod = this.indexToXylod(offset + (8 - i))
        console.log(xylod)
        xylods.push(xylod)
      }
    }
    // (4 ^ lod - 1) / 3 = x
    // log_4((3 * x) + 1)

    return xylods;
  }

  ngOnInit() {
    this.http.get('assets/datasource.js').subscribe(
      config => {
        var [p, v] = config["p"].split(":", 2)
        this.http.get(config['url'] + '/info?products=' + config["p"]).subscribe(info => {
          var t = info['layers'][p][v]['dimensions'][0]['t'][0]
          console.log("T", t)
          this.http.get(
            config['url'] + '/coverage?products='+config['p']+'&t='+t,
            {
              "responseType": 'arraybuffer',
              'observe': 'body'
            }
          ).subscribe(
            data => {
              var coverage = new Uint8Array(data)
              console.log(coverage)
              console.log(coverage.byteLength)
              console.log(typeof(coverage))
              console.log(coverage[0])
              var c = 0
              for (var i = coverage.byteLength-1; i != 0; i--) {
                c = coverage[i]
                // console.log("C=", c, i)
                if (c > 0) {
                  console.log("Coverage", i, c)
                  this.toXylods(i, c)

                  break;
                }
              }
            },
            err => console.error(err)
          )
        })
      }
    );
  }

  onClickMe() {
    this.clickMessage = 'You are my hero!';
    this.midiRefService.play()
  }


}
