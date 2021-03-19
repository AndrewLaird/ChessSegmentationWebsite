import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public message: string;
  public fen: string;
  public loading: boolean;
  public imagePath: any;
  public doneLoading: boolean;
  public perspective: string;
  public move: string;
  public crop_data: string;
  public filename: string;
  imageURL: any;

  constructor(private http: HttpClient) {
    this.message='';
    this.fen = '';
    this.loading=false;
    this.doneLoading=false;
    this.perspective= 'w';
    this.move= 'w';
    this.crop_data = "";
    this.filename = "No file chosen";
  }

  draw_cropped_image(): void {
    let this_obj = this;
    var img = new Image();
    img.src=  this.imagePath;
    let boardX = (parseFloat(this.crop_data[1]) - parseFloat(this.crop_data[3])/ 2)*100
    let boardY = (parseFloat(this.crop_data[2]) - parseFloat(this.crop_data[4])/ 2)*100
    let boardWidth = parseFloat(this.crop_data[3])*100
    let boardHeight = parseFloat(this.crop_data[4])*100

    //clip path will remove parts of the image to show only what we saw
    //polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
    // top left
    let tlx = boardX.toString() + '%';
    let tly = boardY.toString() + '%';

    // top right
    let trx = (boardX + boardWidth).toString() + '%';
    let top_right_y = boardY.toString() + '%';
    
    // bottom right
    let brx = (boardX + boardWidth).toString() + '%';
    let bry = (boardY + boardHeight).toString() + '%';

    // bottom left
    let blx = (boardX).toString() + '%';
    let bly = (boardY + boardHeight).toString() + '%';

    let polygon_str = "polygon( " + tlx + " " + tly + ", " + trx + " " + top_right_y + ", " + brx + " " + bry + ", " + blx + " " + bly + ")" 

    // this translate gets us to the top left, we want top middle
    console.log(boardX)
    console.log(boardWidth)
    let translate_str = "translate(-" + (boardX) +"%, -" + boardY + "% )"
    // Some math,
    // if the image is 200px tall and our board is (X) percent of that
    // our new board should be 200/X
    let old_height = 300;
    let new_height = Math.floor(old_height / (boardHeight/100)).toString() + 'px';

    let cropped_image = document.getElementById('croppedImage');
    cropped_image!.style.clipPath = polygon_str;
    cropped_image!.style.transform = translate_str;
    cropped_image!.style.height = new_height;
    let crop_container= document.getElementsByClassName('cropped-img')


    
    
    console.log(polygon_str)

    // set the elemetn height to be the same as the board so other elements are still below it
    //cropped_image!.style.height = boardHeight;
    //img.src = this.imagePath;
  }

  reverse_fen(): void{
    console.log('in here');
    // using array reverse
    console.log(this.fen);
    this.fen = this.fen.split('').reverse().join('');
    console.log(this.fen);
  }


  ngOnInit(): void {

  }

  crop_image(): void {

  }

  fen_returned(): void{
    // deal with any tasks that have to be done after
    // the api call is done
    this.loading=false;
    this.doneLoading=true;
  }


  upload(files:FileList | null){
    let reader = new FileReader();
    if(files == null){
      return;
    }
    if(files.length == 0){
      this.message="No file was uploaded"
    }
    this.loading=true;

    // Load the file so the user can see it
    this.imagePath=files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageURL = reader.result;
    }

    let file = <File>files[0];

    this.filename=  file.name;
    // then send the files to the api to get 
    const fd = new FormData()
    fd.append('chessboard', file, file.name);
    this.http.post('/api/',fd).subscribe(
      (res_json: any) => {
        this.fen = res_json['fen']
        this.crop_data = res_json['crop'].split(' ')
        this.fen_returned();
        this.draw_cropped_image()
      }
    )
  }


}
