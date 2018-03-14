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
      // console.log(b >>i, i)
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
  }

  playATile() {
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
              // console.log(coverage)
              // console.log(coverage.byteLength)
              var xylod = null
              for (var i = coverage.byteLength-1; i != 0; i--) {
                var c = coverage[i]
                if (c > 0) {
                  xylod = this.toXylods(i, c)
                  xylod = xylod[xylod.length-1]
                  break;
                }
              }
              if (!!xylod) {
                console.log("Got tile ", xylod, "Playing.")
                this.http.get(
                  config['url'] +
                    "/data?products="+config["p"] +
                    "&t="+t+
                    "&x="+xylod[0]+
                    "&y="+xylod[1]+
                    "&lod="+xylod[2],
                  {
                    'responseType': 'arraybuffer',
                    'observe': 'body'
                  }
                ).subscribe(
                  data => {
                    var tile = new Float32Array(data)
                    console.log("Got tile!", tile.length)
                    this.playTile(tile, 256, 256)
                  },
                  err => console.error(err)
                )
              }
            },
            err => console.error(err)
          )
        })
      }
    );
  }

  onClickMe() {
    this.midiRefService.play()
  }

  numToNote(num) {
    num = Math.abs(num)
    // num = Math.sin(num) * 88

    // Squash the number down into a "nice" range.
    // This shaves off the top and bottom octaves.
    num = (Math.floor(num) % 72) + 8
    if (num == 0 || num != num) {
      return NaN
    }

    var scaleNum = num % 12
    if (
      scaleNum == 1
      || scaleNum == 3
      || scaleNum == 6
      || scaleNum == 8
      || scaleNum == 10
    ) {
      // Bump the note off chromatic.
      num = num + 1
    }

    return num
  }

  duration(num, prev) {
    num = Math.floor(Math.abs(num - prev)) % 4
    if (num == 0) {
      return 0.15
    }
    else if (num == 1) {
      return 0.30
    }
    else if (num == 2) {
      return 0.45
    }
    else {
      return 0.60
    }
  }

  playTile(tile: Float32Array, width: number, height: number) {
    //  play(delay = 0, duration = 0.75, note = 50, velocity = 127) : any {
    var row1 = Math.floor((height / 2) + 2)
    var row2 = Math.floor((height / 2) - 2)
    var offset1 = row1 * width
    var offset2 = row2 * width
    var duration = 0.15
    var delay = 0
    var note = 50
    var velocity = 127
    var prev1 = tile[offset1]
    var prev2 = tile[offset2]

    for (var x = 0; x < width; x++) {
      var num1 = tile[offset1 + x]
      var num2 = tile[offset2 + x]

      duration = this.duration(num1, prev1)
      note = this.numToNote(num1)
      var played = false
      if (!!note && prev1 != num1) {
        this.midiRefService.play(delay, duration, note, velocity)
        played = true
      }

      duration = this.duration(num2, prev2)
      note = this.numToNote(num2)
      if (!!note && prev2 != num2) {
        this.midiRefService.play(delay, duration, note, velocity)
        played = true
      }

      if (played) {
        // Next note.
        delay += duration
      }

      prev1 = num1
      prev2 = num2
    }

  }

}
