import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TfstuffComponent } from './tfstuff.component';

describe('TfstuffComponent', () => {
  let component: TfstuffComponent;
  let fixture: ComponentFixture<TfstuffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TfstuffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TfstuffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
