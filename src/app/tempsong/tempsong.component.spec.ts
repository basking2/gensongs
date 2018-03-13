import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TempsongComponent } from './tempsong.component';

describe('TempsongComponent', () => {
  let component: TempsongComponent;
  let fixture: ComponentFixture<TempsongComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TempsongComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TempsongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
