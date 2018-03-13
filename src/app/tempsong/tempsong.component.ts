import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeScript } from '@angular/platform-browser';

@Component({
  selector: 'app-tempsong',
  templateUrl: './tempsong.component.html',
  styleUrls: ['./tempsong.component.css']
})
export class TempsongComponent implements OnInit {

  script: SafeScript


  constructor(domSanitizer: DomSanitizer) {
    this.script = domSanitizer.bypassSecurityTrustHtml(
      '<script src="assets/tempsong.js" type="text/javascript"></script>'
    )
  }

  ngOnInit() {
  }

}
