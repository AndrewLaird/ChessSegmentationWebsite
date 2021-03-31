import { Component, OnInit, Input, ViewChild, ElementRef,
        AfterViewInit
} from '@angular/core';
//import { Chess } from 'chess.js'

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.scss']
})
export class ChessBoardComponent implements OnInit {
  @ViewChild('chessboard', {static: false}) chessboard?: ElementRef<HTMLCanvasElement>;
  @Input() fen: string;
  public pieces_map: any;
  public pieces: Array<string>;
  public ctx?: CanvasRenderingContext2D | null;
  public piece_width: number;
  public piece_height: number;
  public resolution: number;

  constructor() {
    this.fen = "r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R";
    let location = 'assets/img/'
    this.pieces_map = {
      'p': location+'bp.png',
      'r': location+'br.png',
      'n': location+'bn.png',
      'b': location+'bb.png',
      'q': location+'bq.png',
      'k': location+'bk.png',
      'P': location+'wp.png',
      'R': location+'wr.png',
      'N': location+'wn.png',
      'B': location+'wb.png',
      'Q': location+'wq.png',
      'K': location+'wk.png',
    }
    this.resolution = 1600
    this.piece_width = this.resolution/8;
    this.piece_height = this.resolution/8;
    this.pieces = Object.keys(this.pieces_map);
  }

  ngOnInit(): void {
  }

  ngOnChanges(): void{
    this.refresh_chessboard();
  }

  refresh_chessboard(){
    if(this.chessboard){
      //let scale = this.resolution/1600;
      if(!this.ctx){
        return;
      }
      //this.ctx.setTransform(scale,0,0,scale,0,0);
      this.piece_width = this.chessboard.nativeElement.height/8;
      this.piece_height = this.chessboard.nativeElement.height/8;
      this.fen_to_board(this.chessboard)
    }

  }
  ngAfterViewInit(): void {
    if(this.chessboard){
      // set the resolution (number of pixels)
      this.chessboard.nativeElement.width = this.chessboard.nativeElement.height = 1600;
      // set the display size
      this.chessboard.nativeElement.style.width = this.chessboard.nativeElement.style.height = "300px";
      this.ctx = this.chessboard.nativeElement.getContext('2d');
      this.refresh_chessboard();
    }
  }

  draw_image(img: any,row: number,col: number, _ctx: CanvasRenderingContext2D){
    let _this = this;
    img.onload = function(){
      let result = _ctx.drawImage(img,
                    col * _this.piece_width,
                    row * _this.piece_height,
                    _this.piece_width,
                    _this.piece_height)
    }
  }

  fen_to_board(chessboard: ElementRef<HTMLCanvasElement>): any{
    if(!this.ctx){
      return;
    }
    let _ctx = this.ctx
    let _this =this;
    // draw one big image over the whole canvas
    let background_image = new Image();
    background_image.src ='assets/img/chessboard.png' ;
    background_image.onload = function(){
      _ctx.drawImage( background_image,
                        0, 0,
                        chessboard.nativeElement.height,
                        chessboard.nativeElement.height)
    }
    let chessboard_length = [...Array(8).keys()]
    let board = chessboard_length.map((x)=>[chessboard_length.map((x)=>0)]);
    this.fen.split('/').forEach(function(line, row){
      let line_items = line.split("");
      let col=0
      line_items.forEach(function(item){
        if(_this.pieces.includes(item)){
          // this is a piece
          // make a div right here
          let img_src = _this.pieces_map[item]
          let img = new Image();
          img.src = img_src
          _this.draw_image(img,row,col,_ctx)
          col += 1;
          //_this.ctx.drawImage()
        }
        else{
          //convert to Number
          col += +item
        }
        
      })

    });
  }

}
