class Map {
    constructor() {
        // マップの配列
        this.tiles = [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1
        ];
        // 縦と横の長さ
        this.lenX = 8;
        this.lenY = 8;
    }

    // 座標を配列の番号に変換
    tileAt(x, y) {
        if (x < 0 || this.lenX <= x || y < 0 || this.lenY <= y) return 1;
        return this.tiles[y * this.lenX + x];
    }
}

class Actor {
    constructor(x,y,image){
        this.x=x;
        this.y=y;
        this.image=image;
    }
}

class Camera {
    constructor(x,y){
        this.x=x;
        this.y=y;
    }
}

class Move{
    constructor(actor,dx,dy){
        this.actor=actor;
        this.dx=dx;
        this.dy=dy;
    }
}

class Game{
    constructor(){
        this.map = new Map();
        this.player=null;
        this.camera=new Camera(0,0);
    }
}
let game;

function setup(){
    // ゲーム状態を初期化
    game = new Game();
    // プレイヤーを作る
    let player=new Actor(1,1,"🏃‍♂️‍➡️");
    game.player=player
    // キャンバスを作る
    createCanvas(480,480)
}

function draw(){

    // 1マスの大きさ
    let width=40;
    // 背景色
    background("Bispue");
    // カメラ位置の固定
    textAlign(LEFT,TOP);
    // 表示に余裕を持たせる
    textSize( width*7/8 );

    // 壁の描写
    for (let y=0 ; y<game.map.lenY ; y++){
        for (let x=0 ; x<game.map.lenX ; x++ ){
            let tile=game.map.tileAt(x,y);
            if ( tile === 1 ){
                text("🕺",width*x,width*y);
            }
        }
    }

}