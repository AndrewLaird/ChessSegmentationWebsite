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
  public visible_fen: string;
  public loading: boolean;
  public imagePath: any;
  public doneLoading: boolean;
  public perspective: string;
  public move: string;
  public crop_data: string;
  public filename: string;
  public file: File;
  public example_selected: string;
  public failed: boolean;
  imageURL: any;

  constructor(private http: HttpClient) {
    this.message='';
    this.fen = '';
    this.visible_fen = '';
    this.loading=false;
    this.doneLoading=false;
    this.perspective= 'w';
    this.move= 'w';
    this.crop_data = "";
    this.filename = "No file chosen";
    this.example_selected = "-1";
    this.file = new File(['not_found'], 'filename');
    this.failed = false;
    
    
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
    let translate_str = "translate(-" + (boardX) +"%, -" + boardY + "% )"
    // Some math,
    // if the image is 200px tall and our board is (X) percent of that
    // our new board should be 200/X
    let old_height = 300;
    let new_height = Math.floor(old_height / (boardHeight/100)).toString() + 'px';


    // we know this is loaded because this function is only called after it's loaded
    let cropped_image = document.getElementById('croppedImage');
    cropped_image!.style.clipPath = polygon_str;
    cropped_image!.style.transform = translate_str;
    cropped_image!.style.height = new_height;
  }

  reverse_fen(): void{
    // using array reverse
    this.move= this.move =="w" ? "b" : 'w';
    this.fen = this.fen.split('').reverse().join('');
  }

  reverse_visible_fen(): void{
    // using array reverse
    this.visible_fen = this.visible_fen.split('').reverse().join('');
  }

  flip_board(): void{
    // we have to talk about this
    // the fen has to be from the perspective of white
    // so if we let the user flip the board, they flip the perspective and who they are playing
    this.reverse_visible_fen()
    this.move= this.move =="w" ? "b" : 'w';
    this.perspective = this.perspective =="w" ? "b" : 'w';
  }


  ngOnInit(): void {
    // make the page scroll to the top on page refresh
    window.scroll(0,0);
  }


  copyToClipboard(){
    // From: https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
    //   /* Get the text field */
    var copyText = <HTMLTextAreaElement> document.getElementById("copyArea");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    if (window.isSecureContext && navigator.clipboard) {
      const text = copyText.value
      /* Copy the text inside the text field */
      navigator.clipboard.writeText(text)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });

    } else {
      document.execCommand("copy");
    }
  }

  fen_returned(): void{
    // deal with any tasks that have to be done after
    // the api call is done
    this.loading=false;
    this.doneLoading=true;
    // swap the perspective to be which ever side the white king is 
    // closest to
    let white_king_pos =  this.fen.indexOf('K');
    if(white_king_pos != -1){
      // if the white king is on the top
      if(white_king_pos < this.fen.length/2) {
        this.perspective = 'b';
        this.move = 'b';
        this.fen = this.fen.split('').reverse().join('');
      }
      else{
        this.perspective = 'w';
      }


    }

  }

  process(){
    this.loading=true;
    const fd = new FormData()
    fd.append('chessboard', this.file, this.file.name);
    this.http.post('/api/',fd).subscribe(
      (res_json: any) => {
        if(res_json != null && res_json['code'] == 0){
          this.fen = res_json['fen']
          this.visible_fen = this.fen;
          this.crop_data = res_json['crop'].split(' ')
          this.fen_returned();
          this.failed = false;
        }
        else{
          this.failed = true;
          this.loading = false;
        }
      }
    )

  }

  select_change(){
    // they selected a value so we will load it
    let reader = new FileReader();
    if(this.example_selected == '-1'){
      return;
    }
    let loadImageURL = 'assets/img/'+this.example_selected;

    this.http.get(loadImageURL, {responseType: 'blob'})
    .subscribe(data=>{
      let blob = new Blob([data], {type:'image/png'})
      this.file = new File([data], this.example_selected, {type:'image/png'});
      reader.readAsDataURL(this.file);
      reader.onload = (_event) => {
        this.imageURL = reader.result;
      }
      this.filename=  this.file.name;
      this.loading=false;
      this.doneLoading=false;
    })

  }


  upload(files:FileList | null){
    let reader = new FileReader();
    if(files == null){
      return;
    }
    if(files.length == 0){
      this.message="No file was uploaded"
    }

    // Load the file so the user can see it
    this.imagePath=files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imageURL = reader.result;
    }

    this.file = <File>files[0];

    this.filename=  this.file.name;
    this.loading=false;
    this.doneLoading=false;
    // then send the files to the api to get 
  }
  
  // reset to page load
  restart(){
    this.message='';
    this.fen = '';
    this.visible_fen = '';
    this.loading=false;
    this.doneLoading=false;
    this.perspective= 'w';
    this.move= 'w';
    this.crop_data = "";
    this.filename = "No file chosen";
    this.example_selected = "-1";
    this.file = new File(['not_found'], 'filename');
    this.failed = false;
    window.scroll(0,0);

  }
}
