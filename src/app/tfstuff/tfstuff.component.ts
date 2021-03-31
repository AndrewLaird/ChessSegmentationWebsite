import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-tfstuff',
  templateUrl: './tfstuff.component.html',
  styleUrls: ['./tfstuff.component.scss']
})
export class TfstuffComponent implements OnInit {

  do_stuff(){
    const a = tf.tensor([[1,2], [3,4]])
    console.log(a);
  }

  constructor() {
    this.do_stuff();
  }

  ngOnInit(): void {
  }

}
