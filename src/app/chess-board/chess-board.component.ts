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
  public num_loaded: any;
  public loaded_chess_pieces: any;
  public num_to_piece: any;
  public pieces: Array<string>;
  public ctx?: CanvasRenderingContext2D | null;
  public piece_width: number;
  public piece_height: number;
  public resolution: number;

  constructor() {
    this.fen = "";
    let location = 'assets/img/'
    const pieces_map: Record<string, string>= {
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
      'background': location+'chessboard.png'
    };
    this.num_to_piece = {
      0:'p',
      1:'r',
      2:'n',
      3:'b',
      4:'q',
      5:'k',
      6:'P',
      7:'R',
      8:'N',
      9:'B',
      10:'Q',
      11:'K',
    }
    const _this = this;
    _this.num_loaded = 0;
    _this.loaded_chess_pieces ={};
    Object.keys(pieces_map).map((piece_name: string)=>{
      const piece_location = pieces_map[piece_name];
      let img = new Image();
      img.onload = function(){
        _this.loaded_chess_pieces[piece_name] = (this as HTMLImageElement);
        _this.num_loaded += 1;
        if(_this.fen != "" && _this.num_loaded == 13){
          _this.fen_to_board(_this.chessboard as ElementRef<HTMLCanvasElement>);
        }
      }
      img.src = piece_location 
    });
    this.resolution = 1600
    this.piece_width = this.resolution/8;
    this.piece_height = this.resolution/8;
    this.pieces = Object.keys(pieces_map);
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


  draw_image(image: any,row: number,col: number, _ctx: CanvasRenderingContext2D){
    let _this = this;
    _ctx.drawImage(image,
      col * _this.piece_width,
      row * _this.piece_height,
      _this.piece_width,
      _this.piece_height,
    );
  }

  iterate_over_fen_to_draw(){
    if(!this.ctx){
      return;
    }
    const _ctx = this.ctx;
    const _this = this;
    this.fen.split('/').forEach(function(line, row){
      let line_items = line.split("");
      let col=0
      line_items.forEach(function(item){
        if(_this.pieces.includes(item)){
          // this is a piece
          // make a div right here
          let img = _this.loaded_chess_pieces[item]
          _this.draw_image(img,row,col,_ctx)
          col += 1;
        }
        else{
          //convert to Number
          col += +item
        }
        
      })

    });
  }

  fen_to_board(chessboard: ElementRef<HTMLCanvasElement>): any{
    if(!this.ctx){
      return;
    }
    let _ctx = this.ctx
    let _this =this;

    if(this.num_loaded == 13){
      // draw one big image over the whole canvas
      let background_image = _this.loaded_chess_pieces['background']
      _ctx.drawImage( background_image,
                     0, 0,
                     chessboard.nativeElement.height,
                     chessboard.nativeElement.height)
      this.iterate_over_fen_to_draw();
    }
  }

}
